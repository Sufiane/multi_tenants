import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { DbService } from './db.service';
import { EventResolver } from './event.resolver';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [OrganizationModule],
  providers: [EventService, DbService, EventResolver],
})
export class EventModule {}
