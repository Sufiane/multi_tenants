import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/object-type/user.type';
import { Event } from '../../event/object-type/event.type';

@ObjectType()
export class EventRegistration {
  @Field()
  createdAt: Date;

  @Field()
  user: User;

  @Field()
  event: Event;
}
