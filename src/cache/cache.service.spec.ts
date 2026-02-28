import { Test } from '@nestjs/testing';
import { CacheModule } from './cache.module';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CacheModule],
    }).compile();

    service = moduleRef.get(CacheService);
  });

  it('stores and retrieves values', async () => {
    await service.set('name', 'Ada');
    await service.set('profile', { role: 'admin' });

    await expect(service.get('name')).resolves.toBe('Ada');
    await expect(service.get('profile')).resolves.toEqual({ role: 'admin' });

    await service.delete('name');
    await service.delete('profile');
  });

  it('deletes values', async () => {
    await service.set('token', 'abc');
    await service.delete('token');

    await expect(service.get('token')).resolves.toBeNull();
  });
});
