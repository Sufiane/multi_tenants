import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateEventRegistrationInput } from './dto/create-event-registration.input';
import { DbService } from './db.service';
import { CancelEventRegistrationInput } from './dto/cancel-event-registration.intput';
import { UserWithOrg } from './types/user-with-org.type';
import { EventWithOrg } from './types/event-with-org.type';
import { CancelledRegistration } from './object-type/cancelled-registration.type';
import { CreatedRegistration } from './object-type/created-registration.type';

@Injectable()
export class EventRegistrationsService {
  constructor(private readonly dbService: DbService) {}

  async create(payload: CreateEventRegistrationInput): Promise<CreatedRegistration> {
    const [user, event] = await Promise.all([
      this.dbService.findUserByUuid(payload.userUuid),
      this.dbService.findEventByUuid(payload.eventUuid),
    ]);

    if (!user) {
      throw new NotFoundException('user_not_found');
    }

    if (!event) {
      throw new NotFoundException('event_not_found');
    }

    this.ensureSameOrganization(user, event);

    const dbResult = await this.dbService.createWithCapacity({
      userUuid: payload.userUuid,
      eventUuid: payload.eventUuid,
      organizationId: user.organizationId,
    });

    return {
      createdAt: dbResult.createdAt,
      userUuid: payload.userUuid,
      eventUuid: payload.eventUuid,
    };
  }

  private ensureSameOrganization(user: UserWithOrg, event: EventWithOrg): void {
    if (user.organizationId !== event.organizationId) {
      throw new UnauthorizedException('unauthorized');
    }
  }

  async cancel(payload: CancelEventRegistrationInput): Promise<CancelledRegistration> {
    const userWithOrg = await this.dbService.findUserByUuid(payload.userUuid);

    // Shouldn't be possible if we consider that user are authenticated
    if (!userWithOrg) {
      throw new NotFoundException('user_not_found');
    }

    const eventWithOrg = await this.dbService.findEventByUuid(payload.eventUuid);

    if (!eventWithOrg) {
      throw new NotFoundException('event_not_found');
    }

    this.ensureSameOrganization(userWithOrg, eventWithOrg);

    const eventRegistration = await this.dbService.findEventRegistrationForUser({
      userId: userWithOrg.id,
      eventId: eventWithOrg.id,
    });

    if (!eventRegistration) {
      throw new NotFoundException('registration_not_found');
    }

    return {
      createdAt: eventRegistration.createdAt,
      userUuid: userWithOrg.uuid,
      eventUuid: eventWithOrg.uuid,
    };
  }
}
