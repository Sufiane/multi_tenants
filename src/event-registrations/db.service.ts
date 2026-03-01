import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isConstraintFailedError } from '../prisma/errors';
import { EventRegistration } from './object-type/event-registration.type';
import { User } from '../user/object-type/user.type';
import { Event } from '../event/object-type/event.type';

@Injectable()
export class DbService {
  private readonly logger = new Logger(`EventRegistration-${DbService.name}`);

  constructor(private readonly prismaService: PrismaService) {}

  async findUserByUuid(uuid: string): Promise<User | null> {
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

  async findEventByUuid(uuid: string): Promise<Event | null> {
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
  }): Promise<EventRegistration> {
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
}
