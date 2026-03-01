import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isConstraintFailedError, isNotFoundError } from '../prisma/errors';
import { Event } from './object-type/event.type';
import { pick } from 'radash';
import { ValidatedEvent } from './event.service';
import { v4 as uuidV4 } from 'uuid';
import { EventWithOrg } from './types/event-with-org.type';

@Injectable()
export class DbService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: {
    name: string;
    capacity: number;
    organizationId: string;
  }): Promise<Event> {
    try {
      const dbResult = await this.prismaService.events.create({
        data: { ...payload, uuid: uuidV4(), remainingCapacity: payload.capacity },
        include: {
          organization: true,
        },
      });

      return dbResult;
    } catch (e) {
      if (isConstraintFailedError(e)) {
        throw new BadRequestException(e);
      }

      throw new InternalServerErrorException('internal_error');
    }
  }

  async findAll(organizationId?: string): Promise<EventWithOrg[]> {
    try {
      const where = organizationId ? { organizationId } : {};

      const dbResults = await this.prismaService.events.findMany({
        where,
        include: {
          organization: true,
        },
      });

      return dbResults;
    } catch {
      throw new InternalServerErrorException('internal_error');
    }
  }

  async findOne(id: string): Promise<EventWithOrg | null> {
    try {
      const dbResult = await this.prismaService.events.findUnique({
        where: { id },
        include: {
          organization: true,
        },
      });

      return dbResult;
    } catch {
      throw new InternalServerErrorException('internal_error');
    }
  }

  async update(
    payload: {
      id: string;
      organizationId: string;
      remainingCapacity?: number;
    } & Pick<ValidatedEvent, 'name' | 'capacity'>,
  ): Promise<Event> {
    try {
      const dbResult = await this.prismaService.events.update({
        where: { id: payload.id, organizationId: payload.organizationId },
        data: { ...pick(payload, ['name', 'capacity', 'remainingCapacity']) },
        include: {
          organization: true,
        },
      });

      return dbResult;
    } catch (e) {
      if (isNotFoundError(e)) {
        throw new NotFoundException('event_not_found');
      }

      throw new InternalServerErrorException('internal_error');
    }
  }

  async delete(payload: { id: string; organizationId: string }): Promise<Event> {
    try {
      const dbResult = await this.prismaService.events.delete({
        where: { id: payload.id, organizationId: payload.organizationId },
        include: {
          organization: true,
        },
      });

      return dbResult;
    } catch (e) {
      if (isNotFoundError(e)) {
        throw new NotFoundException('event_not_found');
      }

      throw new InternalServerErrorException('internal_error');
    }
  }
}
