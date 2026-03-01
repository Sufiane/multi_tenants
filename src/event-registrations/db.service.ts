import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isConstraintFailedError } from '../prisma/errors';
import { EventRegistration } from './object-type/event-registration.type';
import { User } from '../user/object-type/user.type';
import { Event } from '../event/object-type/event.type';

@Injectable()
export class DbService {
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
      throw new InternalServerErrorException('internal_error');
    }
  }

  async create(payload: {
    userId: string;
    eventId: string;
    organizationId: string;
  }): Promise<EventRegistration> {
    try {
      return await this.prismaService.registrations.create({
        data: payload,
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
    } catch (e) {
      if (isConstraintFailedError(e)) {
        throw new BadRequestException('registration_already_exists');
      }

      throw new InternalServerErrorException('internal_error');
    }
  }
}

