import { AbstractEnum } from './abstract-enum';

export class UserStatus extends AbstractEnum {
    public static readonly STATUS_INACTIVE = 0;
    public static readonly STATUS_ACTIVE = 1;
    public static readonly STATUS_PENDING_EMAIL_VERIFICATION = 2;
    public static readonly STATUS_PENDING_PHONE_VERIFICATION = 3;

    protected static choices: { [key: number]: any } = {
        [UserStatus.STATUS_INACTIVE]: 'Inactive',
        [UserStatus.STATUS_ACTIVE]: 'Active',
        [UserStatus.STATUS_PENDING_EMAIL_VERIFICATION]: 'Pending Email Verification',
        [UserStatus.STATUS_PENDING_PHONE_VERIFICATION]: 'Pending Phone Verification',
    };
}
