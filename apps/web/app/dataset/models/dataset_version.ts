import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import BaseModel from '#common/models/base_model'
import Dataset from '#app/dataset/models/dataset'

export default class DatasetVersion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare datasetId: number

  @column()
  declare name: string

  @column()
  declare path: string

  @belongsTo(() => Dataset)
  declare dataset: BelongsTo<typeof Dataset>
}
