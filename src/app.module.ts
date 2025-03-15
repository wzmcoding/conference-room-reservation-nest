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
import { EmailModule } from './email/email.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { LoginGuard } from './login.guard';
import { PermissionGuard } from './permission.guard';
import { MeetingRoomModule } from './meeting-room/meeting-room.module';
import { MeetingRoom } from "./meeting-room/entities/meeting-room.entity";
import { BookingModule } from './booking/booking.module';
import { Booking } from "./booking/entities/booking.entity";
import { StatisticModule } from './statistic/statistic.module';
import * as path from 'path';

@Module({
  imports: [
    /** 配置 JWT 模块。 **/
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('jwt_secret'),
          signOptions: {
            expiresIn: '30m', // 默认 30 分钟
          }
        }
      },
      inject: [ConfigService]
    }),
    /** 设置为全局模块，指定 env 文件的位置。 **/
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: 'src/.env'
      // 加载配置文件的目录要改成拼接 __dirname 和 .env 的路径。因为 build 出来的代码没有 src 目录，是直接放在 dist 下的
      envFilePath: path.join(__dirname, '.env')
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return {
          type: "mysql",
          host: configService.get('mysql_server_host'),
          port: configService.get('mysql_server_port'),
          username: configService.get('mysql_server_username'),
          password: configService.get('mysql_server_password'),
          database: configService.get('mysql_server_database'),
          synchronize: true, // 自动同步实体类到数据库
          logging: true, // 启用日志
          entities: [
            User,
            Role,
            Permission,
            MeetingRoom,
            Booking
          ],
          poolSize: 10, // 连接池大小
          connectorPackage: 'mysql2', // 连接器包
          extra: {
            /* sha256_password 是一种更安全的密码认证方式，比传统的认证方式提供更好的安全性。 */
            authPlugin: 'sha256_password',
          }
        }
      },
      inject: [ConfigService]
    }),
    UserModule, RedisModule, EmailModule, MeetingRoomModule, BookingModule, StatisticModule,
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: LoginGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard
    }
  ],
})
export class AppModule { }
