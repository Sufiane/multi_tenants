import { Organizations, Users } from '@prisma/client';

export type UserWithOrg = Users & { organization: Organizations };
