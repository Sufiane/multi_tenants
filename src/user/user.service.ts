import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { DbService } from './db.service';
import { User } from './object-type/user.type';
import { OrganizationService } from '../organization/organization.service';
import { pick } from 'radash';

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

    return this.dbService.create({
      organizationId: organization.id,
      ...pick(payload, ['name', 'email']),
    });
  }
}
