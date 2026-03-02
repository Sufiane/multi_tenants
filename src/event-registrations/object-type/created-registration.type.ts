import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreatedRegistration {
  @Field()
  createdAt: Date;

  @Field()
  userUuid: string;

  @Field()
  eventUuid: string;
}
