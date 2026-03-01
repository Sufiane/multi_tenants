import { Field, ObjectType } from '@nestjs/graphql';
import { Organization } from '../../organization/object-type/organization.type';

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
}
