import 'dotenv/config';
import { v4 as uuidV4 } from 'uuid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const org1 = await prisma.organizations.create({
    data: {
      name: 'Organization 1',
      uuid: uuidV4(),
    },
  });

  const user1 = await prisma.users.create({
    data: {
      name: 'User 1',
      email: 'user@email.com',
      uuid: uuidV4(),
      organizationId: org1.id,
    },
  });

  const event1 = await prisma.events.create({
    data: {
      name: 'Event 1',
      capacity: 10,
      remainingCapacity: 10,
      uuid: uuidV4(),
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
