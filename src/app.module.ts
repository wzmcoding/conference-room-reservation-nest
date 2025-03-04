/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';
import { RedisModule } from './redis/redis.module';


@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "123456",
      database: "meeting_room_booking_system",
      synchronize: true, // 自动同步实体类到数据库
      logging: true, // 启用日志
      entities: [
        User,
        Role,
        Permission
      ],
      poolSize: 10, // 连接池大小
      connectorPackage: 'mysql2', // 连接器包
      extra: {
        /* sha256_password 是一种更安全的密码认证方式，比传统的认证方式提供更好的安全性。 */
        authPlugin: 'sha256_password',
      }
    }), UserModule, RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
