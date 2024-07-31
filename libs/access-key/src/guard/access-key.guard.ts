import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccessKey, AccessKeyStatus } from '@libs/orm';

@Injectable()
export class Guard implements CanActivate {
    private readonly permissions: string[] = [];

    constructor(...permissions: string[]) {
        this.permissions = permissions;
    }

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const accessKey = request.user;

        if (accessKey instanceof AccessKey && accessKey.status === AccessKeyStatus.STATUS_ACTIVE) {
            const accessKeyPermissions = accessKey.permissions.getItems().map(({ permission }) => permission);
            return this.checkPermissions(this.permissions, accessKeyPermissions);
        }

        return false;
    }

    private checkPermissions(permissions: string[], accessKeyPermissions: string[]): boolean {
        const intersect = accessKeyPermissions.filter((role: string) => permissions.includes(role));
        return intersect.length > 0;
    }
}

export const AccessKeyGuard = (...permissions: string[]) => new Guard(...permissions);
