import { User } from '@libs/orm';

export class ResetPasswordRequestEvent {
    public static get eventName() {
        return `security.module.${ResetPasswordRequestEvent.name}`;
    }

    constructor(public readonly user: User) {}
}
