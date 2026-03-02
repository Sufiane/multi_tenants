import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isConstraintFailedError } from '../prisma/errors';
import { v4 as uuidV4 } from 'uuid';
import { FullUser } from './types/full-user.type';
import { UserWithOrg } from './types/user-with-org.type';

@Injectable()
export class DbService {
  private readonly logger = new Logger(`User-${DbService.name}`);

  constructor(private readonly prismaService: PrismaService) {}

  async create(payload: {
    name: string;
    email: string;
    organizationId: string;
  }): Promise<UserWithOrg> {
    try {
      const dbResult = await this.prismaService.users.create({
        data: { ...payload, uuid: uuidV4() },
        include: {
          organization: true,
        },
      });

      return dbResult;
    } catch (e) {
      if (isConstraintFailedError(e)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const target = e.meta?.target as string[] | undefined;

        if (target?.includes('email')) {
          throw new BadRequestException('CODE_TO_IDENTIFY_EXISTING_EMAIL_W/O_TELLING_CLIENT');
        }
      }

      this.logger.error('Error creating user', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        payload,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }

  async findByUuid(uuid: string): Promise<FullUser | null> {
    try {
      return await this.prismaService.users.findUnique({
        include: {
          organization: true,
          registrations: {
            include: {
              event: true,
            },
          },
        },
        where: {
          uuid,
        },
      });
    } catch (e) {
      this.logger.error('Error finding user', {
        error: JSON.stringify(e, Object.getOwnPropertyNames(e)),
        uuid,
      });

      throw new InternalServerErrorException('internal_error');
    }
  }
}
