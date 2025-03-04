/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = createClient({
          socket: {
            host: 'localhost',
            port: 6379
          },
          database: 1
        });

        // 添加错误事件监听器
        client.on('error', (err) => {
          console.error('Redis 连接错误:', err);
        });

        // 添加连接事件监听器
        client.on('connect', () => {
          console.log('Redis 连接成功');
        });

        try {
          await client.connect();
          // 检查连接状态
          if (!client.isOpen) {
            throw new Error('Redis 连接失败');
          }
        } catch (error) {
          console.error('Redis 连接失败:', error);
          throw error;
        }

        return client;
      }
    }
  ],
  exports: [RedisService]
})
export class RedisModule { }
