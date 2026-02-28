import { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export const CONSTRAINT_FAILED = 'P2002';
export const NOT_FOUND = 'P2025';
export const isConstraintFailedError = (e: unknown): boolean => {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === CONSTRAINT_FAILED;
};

export const isNotFoundError = (e: unknown): boolean => {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === NOT_FOUND;
};
