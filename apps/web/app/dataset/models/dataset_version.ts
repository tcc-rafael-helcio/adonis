import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import BaseModel from '#common/models/base_model'
import Dataset from '#app/dataset/models/dataset'
import { attachment } from '@jrmc/adonis-attachment'
import type { Attachment } from '@jrmc/adonis-attachment/types/attachment'

export default class DatasetVersion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare datasetId: number

  @column()
  declare name: string

  @attachment()
  declare path: Attachment

  @belongsTo(() => Dataset)
  declare dataset: BelongsTo<typeof Dataset>
}
