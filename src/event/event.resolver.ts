import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Event } from './object-type/event.type';
import { EventService } from './event.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { DeleteEventInput } from './dto/delete-event.input';

@Resolver(() => Event)
export class EventResolver {
  constructor(private readonly eventService: EventService) {}

  @Mutation(() => Event)
  async createEvent(@Args('createEventInput') createEventInput: CreateEventInput): Promise<Event> {
    return this.eventService.create(createEventInput);
  }

  @Mutation(() => Event)
  async updateEvent(@Args('updateEventInput') updateEventInput: UpdateEventInput): Promise<Event> {
    return this.eventService.update(updateEventInput);
  }

  @Mutation(() => Event)
  async deleteEvent(@Args('deleteEventInput') deleteEventInput: DeleteEventInput): Promise<Event> {
    return this.eventService.delete(deleteEventInput);
  }

  @Query(() => [Event])
  async events(@Args('organizationUuid') organizationUuid: string): Promise<Event[]> {
    return this.eventService.findAll(organizationUuid);
  }

  @Query(() => Event)
  async event(
    @Args('id') id: string,
    @Args('organizationUuid') organizationUuid: string,
  ): Promise<Event> {
    return this.eventService.findOne({ id, organizationUuid });
  }
}
