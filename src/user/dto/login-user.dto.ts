/* eslint-disable prettier/prettier */
import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {

    @IsNotEmpty({
        message: "用户名不能为空"
    })
    @ApiProperty()
    username: string;

    @IsNotEmpty({
        message: '密码不能为空'
    })
    @ApiProperty()
    password: string;
}
