/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from '../redis/redis.service';
import { md5 } from 'src/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class UserService {
    private logger = new Logger();

    @InjectRepository(User)
    private userRepository: Repository<User>;

    @InjectRepository(Role)
    private roleRepository: Repository<Role>;

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>;

    @Inject(RedisService)
    private redisService: RedisService;

    async register(user: RegisterUserDto) {
        const captcha = await this.redisService.get(`captcha_${user.email}`);
        if (!captcha) {
            throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
        }

        if (user.captcha !== captcha) {
            throw new HttpException('验证码不正确', HttpStatus.BAD_REQUEST);
        }

        const foundUser = await this.userRepository.findOneBy({
            username: user.username
        });

        if (foundUser) {
            throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
        }

        const newUser = new User();
        newUser.username = user.username;
        newUser.password = md5(user.password);
        newUser.email = user.email;
        newUser.nickName = user.nickName;

        try {
            await this.userRepository.save(newUser);
            return '注册成功';
        } catch (e) {
            this.logger.error(e, UserService);
            return '注册失败';
        }
    }

    /**
     * 初始化数据
     * 张三是管理员，有 ccc 和 ddd 接口访问权限。
     * 李四是普通用户，只有 ccc 接口的访问权限。
     */
    async initData() {
        const user1 = new User();
        user1.username = "zhangsan";
        user1.password = md5("111111");
        user1.email = "xxx@xx.com";
        user1.isAdmin = true;
        user1.nickName = '张三';
        user1.phoneNumber = '13233323333';

        const user2 = new User();
        user2.username = 'lisi';
        user2.password = md5("222222");
        user2.email = "yy@yy.com";
        user2.nickName = '李四';

        const role1 = new Role();
        role1.name = '管理员';

        const role2 = new Role();
        role2.name = '普通用户';

        const permission1 = new Permission();
        permission1.code = 'ccc';
        permission1.description = '访问 ccc 接口';

        const permission2 = new Permission();
        permission2.code = 'ddd';
        permission2.description = '访问 ddd 接口';

        user1.roles = [role1];
        user2.roles = [role2];

        role1.permissions = [permission1, permission2];
        role2.permissions = [permission1];

        await this.permissionRepository.save([permission1, permission2]);
        await this.roleRepository.save([role1, role2]);
        await this.userRepository.save([user1, user2]);
    }
}
