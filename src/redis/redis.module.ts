/* eslint-disable prettier/prettier */
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        const client = createClient({
          socket: {
            host: configService.get('redis_server_host'),
            port: configService.get('redis_server_port')
          },
          database: configService.get('redis_server_db')
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
      },
      inject: [ConfigService]
    }
  ],
  exports: [RedisService]
})
export class RedisModule { }
