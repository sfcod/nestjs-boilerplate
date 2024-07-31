import { Embeddable, Property } from '@mikro-orm/core';

@Embeddable()
export class UserSettings {
    @Property({ nullable: false, default: true })
    emailsEnabled = true;

    @Property({ nullable: false, default: true })
    notificationsEnabled = true;
}
