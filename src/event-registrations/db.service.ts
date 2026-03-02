import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isConstraintFailedError } from '../prisma/errors';
import { Registrations } from '@prisma/client';
import { EventWithOrg } from './types/event-with-org.type';
import { UserWithOrg } from './types/user-with-org.type';

@Injectable()
export class DbService {
  private readonly logger = new Logger(`EventRegistration-${DbService.name}`);

  constructor(private readonly prismaService: PrismaService) {}

  async findUserByUuid(uuid: string): Promise<UserWithOrg | null> {
    try {
      return await this.prismaService.users.findUnique({
        where: { uuid },
        include: {
          organization: true,
        },
      });
    } catch (e) {
      this.logger.error('Error finding user', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        userUuid: uuid,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }

  async findEventByUuid(uuid: string): Promise<EventWithOrg | null> {
    try {
      return await this.prismaService.events.findUnique({
        where: { uuid },
        include: {
          organization: true,
        },
      });
    } catch (e) {
      this.logger.error('Error finding event-registration', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        eventUuid: uuid,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }

  async createWithCapacity(payload: {
    userUuid: string;
    eventUuid: string;
    organizationId: string;
  }): Promise<Registrations> {
    try {
      return await this.prismaService.$transaction(async tx => {
        const updated = await tx.events.updateMany({
          where: {
            uuid: payload.eventUuid,
            remainingCapacity: {
              gt: 0,
            },
          },
          data: {
            remainingCapacity: {
              decrement: 1,
            },
          },
        });

        if (updated.count === 0) {
          throw new BadRequestException('event_full');
        }

        return await tx.registrations.create({
          data: {
            organizationId: payload.organizationId,
            user: {
              connect: {
                uuid: payload.userUuid,
              },
            },
            event: {
              connect: {
                uuid: payload.eventUuid,
              },
            },
          },
          include: {
            user: {
              include: {
                organization: true,
              },
            },
            event: {
              include: {
                organization: true,
              },
            },
          },
        });
      });
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }

      if (isConstraintFailedError(e)) {
        throw new BadRequestException('registration_already_exists');
      }

      this.logger.error('Error creating event-registration', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        payload,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }

  async findEventRegistrationForUser(payload: {
    userId: string;
    eventId: string;
  }): Promise<Registrations | null> {
    try {
      return await this.prismaService.registrations.findUnique({
        where: {
          userId_eventId: {
            userId: payload.userId,
            eventId: payload.eventId,
          },
        },
      });
    } catch (e) {
      this.logger.error('Error finding event-registration for user', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        payload,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }
}
