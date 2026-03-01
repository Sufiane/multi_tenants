import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organizations } from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class DbService {
  private readonly logger = new Logger(`Organization-${DbService.name}`);

  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: { name: string }): Promise<Organizations> {
    const uuid = uuidV4();

    try {
      return await this.prismaService.organizations.create({ data: { ...payload, uuid } });
    } catch (e) {
      this.logger.error('Error creating organization', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        payload,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }

  async findAll(): Promise<Organizations[]> {
    try {
      return await this.prismaService.organizations.findMany();
    } catch (e) {
      this.logger.error('Error findingall organizations', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
      });

      throw new InternalServerErrorException('internal_error');
    }
  }

  async findOneByUuid(uuid: string): Promise<Organizations | null> {
    try {
      return await this.prismaService.organizations.findUnique({
        where: { uuid },
      });
    } catch (e) {
      this.logger.error('Error finding event-registration', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
      });

      throw new InternalServerErrorException('internal_error');
    }
  }
}
