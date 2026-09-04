import { Embeddable, Property } from '@mikro-orm/decorators/legacy';

@Embeddable()
export class UserSettings {
    @Property({ nullable: false, default: true, type: 'boolean' })
    emailsEnabled = true;

    @Property({ nullable: false, default: true, type: 'boolean' })
    notificationsEnabled = true;
}
