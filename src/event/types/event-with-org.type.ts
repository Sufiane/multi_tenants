import { Events, Organizations } from '@prisma/client';

export type EventWithOrg = Events & { organization: Organizations };
