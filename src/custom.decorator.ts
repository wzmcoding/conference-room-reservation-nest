/* eslint-disable prettier/prettier */
import { SetMetadata } from "@nestjs/common";
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from "express";

export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermission = (...permissions: string[]) => SetMetadata('require-permission', permissions);

export const UserInfo = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>();
        // 这个 request.user 是在 LoginGuard 里设置的。
        if (!request.user) {
            return null;
        }
        console.log('@UserInfo', request.user);
        return data ? request.user[data] : request.user;
    },
)
