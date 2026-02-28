import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Organization } from '../../organization/object-type/organization.type';

@ObjectType()
export class Event {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  capacity: number;

  @Field()
  organization: Organization;
}
