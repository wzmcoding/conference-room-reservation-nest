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
      envFilePath: 'src/.env'
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
            MeetingRoom
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
    UserModule, RedisModule, EmailModule, MeetingRoomModule,
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
