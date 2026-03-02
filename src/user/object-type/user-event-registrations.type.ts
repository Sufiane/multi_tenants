import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserEventRegistrations {
  @Field()
  name: string;

  @Field()
  createdAt: Date;
}
