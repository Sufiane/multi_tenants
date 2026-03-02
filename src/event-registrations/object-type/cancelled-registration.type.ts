import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CancelledRegistration {
  @Field()
  createdAt: Date;

  @Field()
  userUuid: string;

  @Field()
  eventUuid: string;
}
