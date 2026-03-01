import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { DbService } from './db.service';
import { Event } from './object-type/event.type';
import { OrganizationService } from '../organization/organization.service';
import { pick } from 'radash';
import { Organization } from '../organization/object-type/organization.type';
import { DeleteEventInput } from './dto/delete-event.input';
import { CacheService } from '../cache/cache.service';
import { CACHE_KEYS } from '../cache/cache_keys';
import { minutesToSeconds } from 'date-fns';
import { Organizations } from '@prisma/client';
import { EventWithOrg } from './types/event-with-org.type';

export type ValidatedEvent = UpdateEventInput &
  (Required<Pick<UpdateEventInput, 'name'>> | Required<Pick<UpdateEventInput, 'capacity'>>);

@Injectable()
export class EventService {
  constructor(
    private readonly dbService: DbService,
    private readonly organizationService: OrganizationService,
    private readonly cacheService: CacheService,
  ) {}

  private async getOrganizationByUuid(uuid: string): Promise<Organizations> {
    const cacheKey = CACHE_KEYS.organization(uuid);
    const cacheData = await this.cacheService.get<Organizations>(cacheKey);

    if (cacheData) {
      return cacheData;
    }

    const organization = await this.organizationService.getByUuid(uuid, false);

    if (!organization) {
      throw new BadRequestException('organization_not_found');
    }

    await this.cacheService.set(cacheKey, organization, minutesToSeconds(10));

    return organization;
  }

  async create(payload: CreateEventInput): Promise<Event> {
    const organization = await this.getOrganizationByUuid(payload.organizationUuid);

    return this.dbService.create({
      organizationId: organization.id,
      ...pick(payload, ['name', 'capacity']),
    });
  }

  async findAll(organizationUuid: string): Promise<Event[]> {
    const organization = await this.getOrganizationByUuid(organizationUuid);

    return this.dbService.findAll(organization.id);
  }

  async findOne(payload: { id: string; organizationUuid: string }): Promise<Event> {
    const organization = await this.getOrganizationByUuid(payload.organizationUuid);

    const event = await this.dbService.findOne(payload.id);

    if (!event) {
      throw new NotFoundException('event_not_found');
    }

    this.checkOwnership(event, organization);

    return event;
  }

  private validateUpdatePayload(payload: UpdateEventInput): asserts payload is ValidatedEvent {
    if (payload.name === undefined && payload.capacity === undefined) {
      throw new BadRequestException('at_least_one_field_required_between_name_and_capacity');
    }
  }

  async update(payload: UpdateEventInput): Promise<Event> {
    this.validateUpdatePayload(payload);

    const organization = await this.getOrganizationByUuid(payload.organizationUuid);

    const event = await this.dbService.findOne(payload.id);

    if (!event) {
      throw new NotFoundException('event_not_found');
    }

    this.checkOwnership(event, organization);

    return this.dbService.update({
      ...pick(payload, ['name', 'capacity']),
      id: event.id,
      organizationId: organization.id,
    });
  }

  async delete(payload: DeleteEventInput): Promise<Event> {
    const organization = await this.getOrganizationByUuid(payload.organizationUuid);

    const event = await this.dbService.findOne(payload.id);

    if (!event) {
      throw new NotFoundException('event_not_found');
    }

    this.checkOwnership(event, organization);

    return this.dbService.delete({
      id: payload.id,
      organizationId: organization.id,
    });
  }

  private checkOwnership(event: EventWithOrg, organization: Organization): void {
    if (event.organization.uuid !== organization.uuid) {
      throw new UnauthorizedException('unauthorized');
    }
  }
}
