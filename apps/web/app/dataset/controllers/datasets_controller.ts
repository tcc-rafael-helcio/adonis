import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import Database from '@adonisjs/lucid/services/db'

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import Dataset from '../models/dataset.js'
import DatasetVersion from '../models/dataset_version.js'
import { addDatasetVersionValidator, createDatasetValidator } from '#app/dataset/validators'

function sanitizePathSegment(value: string) {
  return value
    .trim()
    .replace(/[\\/]+/g, '-')
    .replace(/[:*?"<>|]+/g, '')
    .replace(/\s+/g, ' ')
}

function sanitizeFileName(value: string) {
  const normalized = sanitizePathSegment(value)
  return normalized.length > 0 ? normalized : 'dataset.csv'
}

function parseCsvLine(line: string) {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        index++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function parseCsvPreview(content: string, maxRows = 30) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { headers: [] as string[], rows: [] as string[][] }
  }

  const headers = parseCsvLine(lines[0])
  const rows = lines.slice(1, maxRows + 1).map((line) => parseCsvLine(line))

  return { headers, rows }
}

function getNextVersionName(versionNames: string[]) {
  const maxVersion = versionNames.reduce((acc, versionName) => {
    const match = /^V(\d+)$/i.exec(versionName.trim())
    if (!match) {
      return acc
    }

    const value = Number(match[1])
    return Number.isFinite(value) ? Math.max(acc, value) : acc
  }, 0)

  return `V${maxVersion + 1}`
}

export default class DatasetsController {
  public async index({ inertia }: HttpContext) {
    return inertia.render('dataset/index', {})
  }

  public async viewer({ inertia, request }: HttpContext) {
    const datasets = await Dataset.query()
      .preload('versions', (query) => {
        query.orderBy('id', 'desc')
      })
      .orderBy('id', 'desc')

    const datasetId = Number(request.input('datasetId')) || null
    const versionId = Number(request.input('versionId')) || null

    const selectedDataset = datasetId
      ? datasets.find((dataset) => dataset.id === datasetId) || datasets[0]
      : datasets[0]

    const selectedVersion = selectedDataset
      ? versionId
        ? selectedDataset.versions.find((version) => version.id === versionId) ||
          selectedDataset.versions[0]
        : selectedDataset.versions[0]
      : null

    const suggestedVersionName = selectedDataset
      ? getNextVersionName(selectedDataset.versions.map((version) => version.name))
      : 'V1'

    let previewHeaders: string[] = []
    let previewRows: string[][] = []
    let previewError: string | null = null
    let readmeContent: string | null = null
    let readmeError: string | null = null

    if (selectedVersion) {
      try {
        const csvContent = await readFile(selectedVersion.path, 'utf8')
        const parsed = parseCsvPreview(csvContent)
        previewHeaders = parsed.headers
        previewRows = parsed.rows
      } catch {
        previewError = 'Unable to read dataset file from disk.'
      }

      try {
        const readmePath = join(dirname(selectedVersion.path), 'README.md')
        readmeContent = await readFile(readmePath, 'utf8')
      } catch {
        readmeError = 'Unable to read README.md for this version.'
      }
    }

    return inertia.render('dataset/view', {
      datasets: datasets.map((dataset) => ({
        id: dataset.id,
        name: dataset.name,
        path: dataset.path,
        versions: dataset.versions.map((version) => ({
          id: version.id,
          name: version.name,
          path: version.path,
        })),
      })),
      selectedDatasetId: selectedDataset ? selectedDataset.id : null,
      selectedVersionId: selectedVersion ? selectedVersion.id : null,
      suggestedVersionName,
      previewPath: selectedVersion ? selectedVersion.path : null,
      previewHeaders,
      previewRows,
      previewError,
      readmeContent,
      readmeError,
    })
  }

  public async addVersion({ params, request, response, session }: HttpContext) {
    const dataset = await Dataset.query().where('id', params.id).preload('versions').firstOrFail()
    const payload = await request.validateUsing(addDatasetVersionValidator)
    const datasetFile = request.file('file')

    if (!datasetFile) {
      session.flash('error', 'Please select a CSV file to upload.')
      return response.redirect().toPath(`/datasets/view?datasetId=${dataset.id}`)
    }

    const suggestedVersionName = getNextVersionName(dataset.versions.map((version) => version.name))
    const versionName = sanitizePathSegment(payload.version || suggestedVersionName)

    const existingVersion = await DatasetVersion.query()
      .where('dataset_id', dataset.id)
      .where('name', versionName)
      .first()

    if (existingVersion) {
      session.flash('error', `Version ${versionName} already exists for this dataset.`)
      return response.redirect().toPath(`/datasets/view?datasetId=${dataset.id}`)
    }

    const fileName = sanitizeFileName(datasetFile.clientName)
    const versionPath = join(dataset.path, versionName)
    const readmePath = join(versionPath, 'README.md')
    const filePath = join(versionPath, fileName)

    await mkdir(versionPath, { recursive: true })

    try {
      await datasetFile.move(versionPath, {
        name: fileName,
        overwrite: true,
      })

      const readmeLines = [
        `# ${dataset.name}`,
        '',
        `Version: ${versionName}`,
        '',
        payload.description ? payload.description : 'No description provided.',
        '',
        `Source file: ${fileName}`,
      ]

      await writeFile(readmePath, `${readmeLines.join('\n')}\n`, 'utf8')

      const version = await DatasetVersion.create({
        datasetId: dataset.id,
        name: versionName,
        path: filePath,
      })

      session.flash('success', `Version ${versionName} saved successfully.`)

      return response.redirect().toPath(`/datasets/view?datasetId=${dataset.id}&versionId=${version.id}`)
    } catch {
      await rm(versionPath, { recursive: true, force: true })
      session.flash('error', 'Unable to save the dataset version. Please try again.')
      return response.redirect().toPath(`/datasets/view?datasetId=${dataset.id}`)
    }
  }

  public async store({ auth, request, response, session }: HttpContext) {
    const payload = await request.validateUsing(createDatasetValidator)
    const datasetFile = request.file('file')

    if (!datasetFile) {
      session.flash('error', 'Please select a CSV file to upload.')
      return response.redirect().back()
    }

    const datasetName = sanitizePathSegment(payload.name)
    const versionName = sanitizePathSegment(payload.version || 'V1')
    const fileName = sanitizeFileName(datasetFile.clientName)
    const rootPath = app.makePath('storage/datasets')
    const datasetPath = join(rootPath, datasetName)
    const versionPath = join(datasetPath, versionName)
    const readmePath = join(versionPath, 'README.md')
    const filePath = join(versionPath, fileName)

    await mkdir(versionPath, { recursive: true })

    try {
      await datasetFile.move(versionPath, {
        name: fileName,
        overwrite: true,
      })

      const readmeLines = [
        `# ${payload.name}`,
        '',
        `Version: ${payload.version || 'V1'}`,
        '',
        payload.description ? payload.description : 'No description provided.',
        '',
        `Source file: ${fileName}`,
      ]

      await writeFile(readmePath, `${readmeLines.join('\n')}\n`, 'utf8')

      await Database.transaction(async (trx) => {
        const dataset = await Dataset.create(
          {
            name: payload.name,
            path: datasetPath,
            isPublic: false,
            userId: auth.user!.id,
          },
          { client: trx }
        )

        await DatasetVersion.create(
          {
            datasetId: dataset.id,
            name: versionName,
            path: filePath,
          },
          { client: trx }
        )
      })

      session.flash('success', `Dataset saved locally at ${filePath}`)

      return response.redirect().back()
    } catch {
      await rm(datasetPath, { recursive: true, force: true })
      session.flash('error', 'Unable to save the dataset. Please try again.')
      return response.redirect().back()
    }
  }
}
