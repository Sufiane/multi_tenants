import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventRegistrationInput } from './dto/create-event-registration.input';
import { DbService } from './db.service';
import { EventRegistration } from './object-type/event-registration.type';
import { OrganizationService } from '../organization/organization.service';
import { User } from '../user/object-type/user.type';
import { Event } from '../event/object-type/event.type';
import { Organization } from '../organization/object-type/organization.type';

@Injectable()
export class EventRegistrationsService {
  constructor(
    private readonly dbService: DbService,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(payload: CreateEventRegistrationInput): Promise<EventRegistration> {
    const organization = await this.organizationService.getByUuid(payload.organizationUuid, false);

    if (!organization) {
      throw new BadRequestException('organization_not_found');
    }

    const [user, event] = await Promise.all([
      this.dbService.findUserByUuid(payload.userUuid),
      this.dbService.findEventByUuid(payload.eventUuid),
    ]);

    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    if (!event) {
      throw new NotFoundException('event_not_found');
    }

    this.ensureSameOrganization(user, event, organization);

    return this.dbService.createWithCapacity({
      userUuid: payload.userUuid,
      eventUuid: payload.eventUuid,
      organizationId: organization.id,
    });
  }

  private ensureSameOrganization(user: User, event: Event, organization: Organization): void {
    if (
      user.organization.uuid !== organization.uuid ||
      event.organization.uuid !== organization.uuid
    ) {
      throw new UnauthorizedException('unauthorized');
    }
  }
}
