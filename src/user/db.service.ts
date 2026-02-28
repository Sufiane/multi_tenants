import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CONSTRAINT_FAILED } from '../prisma/errors';
import { User } from './object-type/user.type';

@Injectable()
export class DbService {

    constructor(private readonly prismaService: PrismaService) {
    }

    async create(payload: {
        name: string,
        email: string,
        organizationId: string
    }): Promise<User> {
        try {
            const dbResult = await this.prismaService.users.create({
                data: payload,
                include: {
                    organization: true,
                }
            });

            return dbResult;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === CONSTRAINT_FAILED) {
                const target = e.meta?.target as string[] | undefined;

                if (target?.includes('email')) {
                    throw new BadRequestException(
                        'CODE_TO_IDENTIFY_EXISTING_EMAIL_W/O_TELLING_CLIENT');
                }
            }

            console.log('error', e);

            throw new InternalServerErrorException('internal_error');
        }
    }
}
