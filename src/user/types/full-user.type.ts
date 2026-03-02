import { Events, Organizations, Registrations, Users } from '@prisma/client';

export type FullUser = Users & {
  organization: Organizations;
  registrations: (Registrations & { event: Events })[];
};
