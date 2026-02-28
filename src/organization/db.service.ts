import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Organizations } from '@prisma/client';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class DbService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async create(payload: { name: string }): Promise<void> {
        const uuid = uuidV4();

        await this.prismaService.organizations.create({ data: { ...payload, uuid } });
    }

    findAll(): Promise<Organizations[]> {
        return this.prismaService.organizations.findMany();
    }
}
