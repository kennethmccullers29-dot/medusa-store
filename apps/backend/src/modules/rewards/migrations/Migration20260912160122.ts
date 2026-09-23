import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260912160122 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "rewards_activity" ("id" text not null, "customer_id" text not null, "source_key" text not null, "points" integer not null, "kind" text check ("kind" in ('signup', 'purchase', 'birthday', 'redemption', 'refund')) not null, "note" text not null, "order_id" text null, "earning_rate" real null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rewards_activity_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_REWARDS_ACTIVITY_CUSTOMER" ON "rewards_activity" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_REWARDS_ACTIVITY_SOURCE" ON "rewards_activity" ("source_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rewards_activity_deleted_at" ON "rewards_activity" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "rewards_config" ("id" text not null, "name" text not null, "enabled" boolean not null default true, "signup_points" integer not null, "points_per_unit" integer not null, "birthday_points" integer not null, "redemption_points" integer not null, "discount_percent" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rewards_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rewards_config_deleted_at" ON "rewards_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "rewards_member" ("id" text not null, "customer_id" text not null, "signup_points" integer not null, "birthday_month" integer null, "birthday_day" integer null, "birthday_registered_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rewards_member_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_REWARDS_MEMBER_CUSTOMER" ON "rewards_member" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rewards_member_deleted_at" ON "rewards_member" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "rewards_redemption" ("id" text not null, "customer_id" text not null, "request_id" text not null, "code" text not null, "points" integer not null, "discount_percent" integer not null, "currency_code" text not null, "promotion_id" text null, "status" text check ("status" in ('pending', 'ready')) not null default 'pending', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "rewards_redemption_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_REWARDS_REDEMPTION_CUSTOMER" ON "rewards_redemption" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_REWARDS_REDEMPTION_REQUEST" ON "rewards_redemption" ("request_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_REWARDS_REDEMPTION_CODE" ON "rewards_redemption" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_rewards_redemption_deleted_at" ON "rewards_redemption" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "rewards_activity" cascade;`);

    this.addSql(`drop table if exists "rewards_config" cascade;`);

    this.addSql(`drop table if exists "rewards_member" cascade;`);

    this.addSql(`drop table if exists "rewards_redemption" cascade;`);
  }

}
