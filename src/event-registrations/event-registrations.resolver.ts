import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EventRegistration } from './object-type/event-registration.type';
import { EventRegistrationsService } from './event-registrations.service';
import { CreateEventRegistrationInput } from './dto/create-event-registration.input';

@Resolver(() => EventRegistration)
export class EventRegistrationsResolver {
  constructor(private readonly eventRegistrationsService: EventRegistrationsService) {}

  @Mutation(() => EventRegistration)
  async createEventRegistration(
    @Args('createEventRegistrationInput')
    createEventRegistrationInput: CreateEventRegistrationInput,
  ): Promise<EventRegistration> {
    return this.eventRegistrationsService.create(createEventRegistrationInput);
  }
}
