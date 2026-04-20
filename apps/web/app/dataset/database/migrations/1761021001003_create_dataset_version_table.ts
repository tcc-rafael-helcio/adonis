import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'dataset_versions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('dataset_id')
        .unsigned()
        .references('id')
        .inTable('datasets')
        .onDelete('CASCADE')
        .notNullable()
      table.string('name', 255).notNullable()
      table.string('path', 1024).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
