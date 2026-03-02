import 'dotenv/config';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const org1 = await prisma.organizations.create({
    data: {
      name: 'Organization 1',
      uuid: 'ecdd4d74-cd32-4c78-a5e9-5ee1714f2a55',
    },
  });

  const user1 = await prisma.users.create({
    data: {
      name: 'User 1',
      email: 'user@email.com',
      uuid: '85842442-7420-4a80-a609-ce60be135cce',
      organizationId: org1.id,
    },
  });

  const event1 = await prisma.events.create({
    data: {
      name: 'Event 1',
      capacity: 10,
      remainingCapacity: 10,
      uuid: 'a2bfc8a7-1ff6-4cff-bf1a-941237d3e7a0',
      organizationId: org1.id,
    },
  });

  await prisma.registrations.create({
    data: {
      userId: user1.id,
      eventId: event1.id,
      organizationId: org1.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
