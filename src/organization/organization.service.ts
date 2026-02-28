import { Injectable } from '@nestjs/common';
import { CreateOrganizationInput } from './dto/create-organization.input';

import { DbService } from './db.service';
import { Organization } from './object-type/organization.type';

@Injectable()
export class OrganizationService {
    constructor(private readonly dbService: DbService) {
    }

    async create(createOrganizationInput: CreateOrganizationInput): Promise<void> {
        await this.dbService.create(createOrganizationInput);
    }

    async findAll(): Promise<Organization[]> {
        return this.dbService.findAll();
    }

    async getByUuid(uuid: string): Promise<Organization | null> {
        return this.dbService.findOneByUuid(uuid)
    }
}
