import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { DbService } from './db.service';
import { UserResolver } from './user.resolver';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  imports: [OrganizationModule],
  providers: [UserService, DbService, UserResolver],
})
export class UserModule {}
