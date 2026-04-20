import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'datasets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 255).notNullable()
    //   table
    //     .integer('license_id')
    //     .unsigned()
    //     .references('id')
    //     .inTable('licenses')
    //     .onDelete('RESTRICT')
    //     .notNullable()
      table.string('path', 1024).notNullable()
      table.boolean('is_public').notNullable().defaultTo(false)
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()
    //   table.integer('team_id').unsigned().references('id').inTable('teams').onDelete('SET NULL').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
