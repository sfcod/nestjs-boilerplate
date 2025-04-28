import { Migration } from '@mikro-orm/migrations';

export class Migration20250428145459 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "admin" ("id" uuid not null, "name" varchar(255) null, "email" varchar(255) not null, "phone_number" VARCHAR null, "phone_verification_code" varchar(6) null, "phone_verified" boolean not null default false, "two_factor_auth" text check ("two_factor_auth" in ('sms', 'email')) null, "roles" varchar(255) not null default '["ROLE_SYSTEM_ADMIN"]', "password" varchar(255) not null, "recovery_password_token" varchar(255) null, "status" smallint not null, "created_at" timestamp not null, "updated_at" timestamp not null, constraint "admin_pkey" primary key ("id"));`);

    this.addSql(`create table "user" ("id" uuid not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "email" varchar(255) not null, "status" smallint not null, "password" varchar(255) null, "recovery_password_token" varchar(255) null, "phone_number" VARCHAR null, "phone_verification_code" varchar(6) null, "phone_verified" boolean not null default false, "email_verified" boolean not null default false, "two_factor_auth" text check ("two_factor_auth" in ('sms', 'email')) null, "settings" jsonb not null, "created_at" timestamp not null, "updated_at" timestamp not null, "deleted_at" bigint null, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_recovery_password_token_unique" unique ("recovery_password_token");`);

    this.addSql(`create table "notification" ("id" uuid not null, "user_id" uuid not null, "type" smallint not null, "status" smallint not null default 0, "created_at" timestamp not null, "updated_at" timestamp not null, "title" varchar(255) null, "message" text null, "data" text not null default '{}', constraint "notification_pkey" primary key ("id"));`);

    this.addSql(`create table "device" ("id" uuid not null, "owner_id" uuid not null, "unique_id" varchar(255) not null, "token" varchar(255) not null, "os" varchar(255) not null, "created_at" timestamp not null, "updated_at" timestamp not null, constraint "device_pkey" primary key ("id"));`);
    this.addSql(`alter table "device" add constraint "device_owner_id_unique_id_unique" unique ("owner_id", "unique_id");`);

    this.addSql(`create table "user_attribute" ("id" uuid not null, "user_id" uuid not null, "name" varchar(255) not null, "value" jsonb null, "updated_at" timestamp not null, constraint "user_attribute_pkey" primary key ("id"));`);
    this.addSql(`alter table "user_attribute" add constraint "user_attribute_user_id_name_unique" unique ("user_id", "name");`);

    this.addSql(`create table "user_social" ("id" uuid not null, "user_id" uuid not null, "provider" varchar(255) not null, "social_user_id" varchar(255) not null, "token" varchar(255) null, "data" varchar(255) null, "created_at" timestamp not null, "updated_at" timestamp not null, constraint "user_social_pkey" primary key ("id"));`);

    this.addSql(`create table "webauthn_device" ("id" uuid not null, "user_id" uuid not null, "credential_id" text not null, "credential_public_key" text not null, "counter" bigint not null, "credential_device_type" varchar(255) not null, "credential_backed_up" boolean not null, "transports" text[] not null, "aaguid" varchar(255) null, "created_at" timestamp not null, "updated_at" timestamp not null, "last_used_at" timestamp null, constraint "webauthn_device_pkey" primary key ("id"));`);
    this.addSql(`create index "webauthn_device_credential_id_index" on "webauthn_device" ("credential_id");`);

    this.addSql(`alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update no action on delete cascade;`);

    this.addSql(`alter table "device" add constraint "device_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update no action on delete cascade;`);

    this.addSql(`alter table "user_attribute" add constraint "user_attribute_user_id_foreign" foreign key ("user_id") references "user" ("id") on update no action on delete cascade;`);

    this.addSql(`alter table "user_social" add constraint "user_social_user_id_foreign" foreign key ("user_id") references "user" ("id") on update no action;`);

    this.addSql(`alter table "webauthn_device" add constraint "webauthn_device_user_id_foreign" foreign key ("user_id") references "user" ("id") on update no action on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "notification" drop constraint "notification_user_id_foreign";`);

    this.addSql(`alter table "device" drop constraint "device_owner_id_foreign";`);

    this.addSql(`alter table "user_attribute" drop constraint "user_attribute_user_id_foreign";`);

    this.addSql(`alter table "user_social" drop constraint "user_social_user_id_foreign";`);

    this.addSql(`alter table "webauthn_device" drop constraint "webauthn_device_user_id_foreign";`);

    this.addSql(`drop table if exists "admin" cascade;`);

    this.addSql(`drop table if exists "user" cascade;`);

    this.addSql(`drop table if exists "notification" cascade;`);

    this.addSql(`drop table if exists "device" cascade;`);

    this.addSql(`drop table if exists "user_attribute" cascade;`);

    this.addSql(`drop table if exists "user_social" cascade;`);

    this.addSql(`drop table if exists "webauthn_device" cascade;`);
  }

}
