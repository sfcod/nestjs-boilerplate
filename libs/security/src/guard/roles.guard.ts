import { CanActivate, ExecutionContext } from '@nestjs/common';

class Guard implements CanActivate {
    private readonly roles: string[] = [];

    constructor(...roles: string[]) {
        this.roles = roles;
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        if (!this.roles.length) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        return await request.rolePermission.isGranted(user, this.roles);
    }
}

export const RolesGuard = (...roles: string[]) => new Guard(...roles);
