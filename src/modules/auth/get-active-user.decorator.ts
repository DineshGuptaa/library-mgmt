// decorators/get-active-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const GetActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // This matches whatever key your AccessTokenGuard uses to attach the payload
    // standard is request['user']
    return request['user']; 
  },
);