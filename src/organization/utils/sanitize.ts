import { Organizations } from '@prisma/client';
import { Organization } from '../object-type/organization.type';
import { omit } from 'radash';

export const sanitize = (rawOrg: Organizations): Organization => {
  return omit(rawOrg, ['id']);
};
