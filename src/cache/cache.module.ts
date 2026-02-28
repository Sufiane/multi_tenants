import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [NestCacheModule.register()],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
