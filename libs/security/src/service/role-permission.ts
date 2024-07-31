import { UserInterface } from '../contract/user-interface';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RolePermission {
    constructor(@Inject('HIERARCHY_ROLES') private readonly hierarchyRoles: any) {}

    public async isGranted(user: UserInterface, roles: string[]): Promise<boolean> {
        const promises: Promise<any>[] = [];

        user.getRoles().forEach((role: string) => {
            roles.forEach((operation: string) => {
                promises.push(this.hierarchyRoles.can(role, operation));
            });
        });

        const results = await Promise.all(promises);

        return results.filter((val) => val).length > 0;
    }
}
