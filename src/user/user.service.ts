import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { DbService } from './db.service';
import { User } from './object-type/user.type';
import { OrganizationService } from '../organization/organization.service';
import { omit, pick } from 'radash';

@Injectable()
export class UserService {
  constructor(
    private readonly dbService: DbService,
    private readonly organizationService: OrganizationService,
  ) {}

  async create(payload: CreateUserInput): Promise<User> {
    const organization = await this.organizationService.getByUuid(payload.organizationUuid, false);

    if (!organization) {
      throw new BadRequestException('organization_not_found');
    }

    const dbResult = await this.dbService.create({
      organizationId: organization.id,
      ...pick(payload, ['name', 'email']),
    });

    return {
      ...omit(dbResult, ['organizationId']),
      registrations: [],
      organization: dbResult.organization,
    };
  }

  async find(uuid: string): Promise<User> {
    const user = await this.dbService.findByUuid(uuid);

    if (!user) {
      throw new BadRequestException('user_not_found');
    }

    return {
      ...omit(user, ['organizationId', 'registrations']),
      registrations: user.registrations.map(registration => ({
        name: registration.event.name,
        createdAt: registration.createdAt,
      })),
    };
  }
}
