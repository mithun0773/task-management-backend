import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/user-payload.interface';

// Allows us to use @CurrentUser() or @CurrentUser('id')
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    // If data is provided (e.g., 'id'), return just that property
    return data ? user?.[data] : user;
  },
);
