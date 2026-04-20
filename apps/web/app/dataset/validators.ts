import vine from '@vinejs/vine'

export const createDatasetValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).unique({ table: 'datasets', column: 'name' }),
    version: vine.string().trim().minLength(1).maxLength(32).optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    file: vine
      .file({
        extnames: ['csv'],
        size: 25 * 1024 * 1024,
      }),
  })
)

export const addDatasetVersionValidator = vine.compile(
  vine.object({
    version: vine.string().trim().minLength(1).maxLength(32).optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    file: vine
      .file({
        extnames: ['csv'],
        size: 25 * 1024 * 1024,
      }),
  })
)
