import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Organization {
  @Field()
  name: string;

  @Field()
  uuid: string;
}
