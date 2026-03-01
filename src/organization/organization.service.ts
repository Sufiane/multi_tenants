import { Injectable } from '@nestjs/common';
import { CreateOrganizationInput } from './dto/create-organization.input';

import { DbService } from './db.service';
import { Organization } from './object-type/organization.type';
import { sanitize } from './utils/sanitize';
import { Organizations } from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly dbService: DbService) {}

  async create(createOrganizationInput: CreateOrganizationInput): Promise<Organization> {
    return sanitize(await this.dbService.create(createOrganizationInput));
  }

  async findAll(): Promise<Organization[]> {
    return (await this.dbService.findAll()).map(sanitize);
  }

  async getByUuid(uuid: string, shouldSanitize?: true): Promise<Organization | null>;
  async getByUuid(uuid: string, shouldSanitize: false): Promise<Organizations | null>;
  async getByUuid(
    uuid: string,
    shouldSanitize = true,
  ): Promise<Organization | Organizations | null> {
    const dbResult = await this.dbService.findOneByUuid(uuid);

    if (!dbResult) {
      return null;
    }

    return shouldSanitize ? sanitize(dbResult) : dbResult;
  }
}
