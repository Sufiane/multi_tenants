import { Module } from '@nestjs/common';
import { EventRegistrationsService } from './event-registrations.service';
import { DbService } from './db.service';
import { EventRegistrationsResolver } from './event-registrations.resolver';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [OrganizationModule],
  providers: [EventRegistrationsService, DbService, EventRegistrationsResolver],
})
export class EventRegistrationsModule {}
