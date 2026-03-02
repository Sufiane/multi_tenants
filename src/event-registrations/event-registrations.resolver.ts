import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EventRegistration } from './object-type/event-registration.type';
import { EventRegistrationsService } from './event-registrations.service';
import { CreateEventRegistrationInput } from './dto/create-event-registration.input';
import { CancelEventRegistrationInput } from './dto/cancel-event-registration.intput';
import { CancelledRegistration } from './object-type/cancelled-registration.type';
import { CreatedRegistration } from './object-type/created-registration.type';

@Resolver(() => EventRegistration)
export class EventRegistrationsResolver {
  constructor(private readonly eventRegistrationsService: EventRegistrationsService) {}

  @Mutation(() => CreatedRegistration)
  async createEventRegistration(
    @Args('createEventRegistrationInput')
    createEventRegistrationInput: CreateEventRegistrationInput,
  ): Promise<CreatedRegistration> {
    return this.eventRegistrationsService.create(createEventRegistrationInput);
  }

  @Mutation(() => CancelledRegistration)
  async cancelEventRegistration(
    @Args('cancelEventRegistrationInput')
    cancelEventRegistrationInput: CancelEventRegistrationInput,
  ): Promise<CancelledRegistration> {
    return this.eventRegistrationsService.cancel(cancelEventRegistrationInput);
  }
}
