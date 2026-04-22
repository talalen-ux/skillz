import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * MVP auth shim: trusts `x-user-id` header. Replace with real JWT/OAuth in prod.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.headers['x-user-id'] as string | undefined;
  },
);
