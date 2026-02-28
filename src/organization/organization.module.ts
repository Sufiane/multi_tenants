import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationResolver } from './organization.resolver';
import { DbService } from './db.service';

@Module({
    providers: [OrganizationResolver, OrganizationService, DbService],
    exports: [OrganizationService],
})
export class OrganizationModule {
}
