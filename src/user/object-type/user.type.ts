import { Field, ObjectType } from '@nestjs/graphql';
import { Organization } from '../../organization/object-type/organization.type';
import { UserEventRegistrations } from './user-event-registrations.type';

@ObjectType()
export class User {
  @Field()
  uuid: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  organization: Organization;

  @Field(() => [UserEventRegistrations])
  registrations: UserEventRegistrations[];
}
