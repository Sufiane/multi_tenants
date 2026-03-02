import { Test, TestingModule } from '@nestjs/testing';
import { EventRegistrationsService } from './event-registrations.service';
import { DbService } from './db.service';
import { CreateEventRegistrationInput } from './dto/create-event-registration.input';
import { CancelEventRegistrationInput } from './dto/cancel-event-registration.intput';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserWithOrg } from './types/user-with-org.type';
import { EventWithOrg } from './types/event-with-org.type';
import { Registrations } from '@prisma/client';

describe('EventRegistrationsService', () => {
  let service: EventRegistrationsService;
  let dbServiceMock: DeepMockProxy<DbService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventRegistrationsService],
    })
      .useMocker(mockDeep)
      .compile();

    service = module.get<EventRegistrationsService>(EventRegistrationsService);
    dbServiceMock = module.get<DbService>(DbService) as DeepMockProxy<DbService>;
  });

  describe('create', () => {
    const payload: CreateEventRegistrationInput = {
      userUuid: 'user-123',
      eventUuid: 'event-456',
    };

    describe('when everything is valid', () => {
      it('returns the created registration', async () => {
        const user = { uuid: payload.userUuid, organizationId: 'org-1' } as UserWithOrg;
        const event = { uuid: payload.eventUuid, organizationId: 'org-1' } as EventWithOrg;
        const dbResult = { createdAt: new Date() } as Registrations;

        dbServiceMock.findUserByUuid.mockResolvedValue(user);
        dbServiceMock.findEventByUuid.mockResolvedValue(event);
        dbServiceMock.createWithCapacity.mockResolvedValue(dbResult);

        await expect(service.create(payload)).resolves.toEqual({
          createdAt: dbResult.createdAt,
          userUuid: payload.userUuid,
          eventUuid: payload.eventUuid,
        });
      });
    });

    describe('when user is not found', () => {
      it('throws NotFoundException', async () => {
        dbServiceMock.findUserByUuid.mockResolvedValue(null);
        dbServiceMock.findEventByUuid.mockResolvedValue({} as EventWithOrg);
        await expect(service.create(payload)).rejects.toThrow(NotFoundException);
      });
    });

    describe('when event is not found', () => {
      it('throws NotFoundException', async () => {
        dbServiceMock.findUserByUuid.mockResolvedValue({} as UserWithOrg);
        dbServiceMock.findEventByUuid.mockResolvedValue(null);

        await expect(service.create(payload)).rejects.toThrow(NotFoundException);
      });
    });

    describe('when user and event belong to different organizations', () => {
      it('throws UnauthorizedException', async () => {
        const user = { uuid: payload.userUuid, organizationId: 'org-1' } as UserWithOrg;
        const event = { uuid: payload.eventUuid, organizationId: 'org-2' } as EventWithOrg;
        dbServiceMock.findUserByUuid.mockResolvedValue(user);
        dbServiceMock.findEventByUuid.mockResolvedValue(event);

        await expect(service.create(payload)).rejects.toThrow(UnauthorizedException);
      });
    });
  });

  describe('cancel', () => {
    const payload: CancelEventRegistrationInput = {
      userUuid: 'user-123',
      eventUuid: 'event-456',
    };

    describe('when everything is valid', () => {
      it('returns the cancelled registration', async () => {
        const user = {
          uuid: payload.userUuid,
          id: 1,
          organizationId: 'org-1',
        } as unknown as UserWithOrg;
        const event = {
          uuid: payload.eventUuid,
          id: 2,
          organizationId: 'org-1',
        } as unknown as EventWithOrg;
        const registration = {
          createdAt: new Date(),
          userId: 1,
          eventId: 2,
        } as unknown as Registrations;

        dbServiceMock.findUserByUuid.mockResolvedValue(user);
        dbServiceMock.findEventByUuid.mockResolvedValue(event);
        dbServiceMock.findEventRegistrationForUser.mockResolvedValue(registration);

        await expect(service.cancel(payload)).resolves.toEqual({
          createdAt: registration.createdAt,
          userUuid: user.uuid,
          eventUuid: event.uuid,
        });
      });
    });

    describe('when user is not found', () => {
      it('throws NotFoundException', async () => {
        dbServiceMock.findUserByUuid.mockResolvedValue(null);

        await expect(service.cancel(payload)).rejects.toThrow(NotFoundException);
      });
    });

    describe('when event is not found', () => {
      it('throws NotFoundException', async () => {
        const user = {
          uuid: payload.userUuid,
          id: 1,
          organizationId: 'org-1',
        } as unknown as UserWithOrg;
        dbServiceMock.findUserByUuid.mockResolvedValue(user);
        dbServiceMock.findEventByUuid.mockResolvedValue(null);

        await expect(service.cancel(payload)).rejects.toThrow(NotFoundException);
      });
    });

    describe('when registration is not found', () => {
      it('throws NotFoundException', async () => {
        const user = {
          uuid: payload.userUuid,
          id: 1,
          organizationId: 'org-1',
        } as unknown as UserWithOrg;
        const event = {
          uuid: payload.eventUuid,
          id: 2,
          organizationId: 'org-1',
        } as unknown as EventWithOrg;

        dbServiceMock.findUserByUuid.mockResolvedValue(user);
        dbServiceMock.findEventByUuid.mockResolvedValue(event);
        dbServiceMock.findEventRegistrationForUser.mockResolvedValue(null);

        await expect(service.cancel(payload)).rejects.toThrow(NotFoundException);
      });
    });

    describe('when user and event belong to different organizations', () => {
      it('throws UnauthorizedException', async () => {
        const user = {
          uuid: payload.userUuid,
          id: 1,
          organizationId: 'org-1',
        } as unknown as UserWithOrg;
        const event = {
          uuid: payload.eventUuid,
          id: 2,
          organizationId: 'org-2',
        } as unknown as EventWithOrg;

        dbServiceMock.findUserByUuid.mockResolvedValue(user);
        dbServiceMock.findEventByUuid.mockResolvedValue(event);

        await expect(service.cancel(payload)).rejects.toThrow(UnauthorizedException);
      });
    });
  });
});
