import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'

import type { InertiaProps } from '#core/ui/types'
import { Field, FieldError, Form } from '#common/ui/components/form'
import useFlashMessage from '#common/ui/hooks/use_flash_message'

import AppLayout from '#common/ui/components/app_layout'
import Heading from '#common/ui/components/heading'
import { Main } from '#common/ui/components/main'

import { useTranslation } from '#common/ui/hooks/use_translation'

type PageProps = InertiaProps<{
  datasets: {
    id: number
    name: string
    path: string
    versions: {
      id: number
      name: string
      path: string
    }[]
  }[]
  selectedDatasetId: number | null
  selectedVersionId: number | null
  suggestedVersionName: string
  previewPath: string | null
  previewHeaders: string[]
  previewRows: string[][]
  previewError: string | null
  readmeContent: string | null
  readmeError: string | null
}>

export default function ViewDatasetsPage({
  datasets,
  selectedDatasetId,
  selectedVersionId,
  suggestedVersionName,
  previewPath,
  previewHeaders,
  previewRows,
  previewError,
  readmeContent,
  readmeError,
}: PageProps) {
  const { t } = useTranslation()
  const successMessage = useFlashMessage('success')
  const errorMessage = useFlashMessage('error')
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)

  const selectedDataset = datasets.find((dataset) => dataset.id === selectedDatasetId) || null

  return (
    <AppLayout
      breadcrumbs={[
        { label: t('dataset.index.page.breadcrumbs.dataset'), href: '/datasets' },
        { label: t('dataset.view.page.breadcrumb') },
      ]}
    >
      <Main>
        <Heading
          title={t('dataset.view.page.title')}
          description={t('dataset.view.page.description')}
        >
          <Link href="/datasets" className="inline-flex h-9 items-center rounded-lg border px-3 text-sm">
            {t('dataset.view.page.actions.back_upload')}
          </Link>
        </Heading>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">{t('dataset.view.page.datasets')}</p>

            {datasets.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{t('dataset.view.page.empty')}</p>
            ) : (
              <div className="mt-4 space-y-2">
                {datasets.map((dataset) => (
                  <Link
                    key={dataset.id}
                    href={`/datasets/view?datasetId=${dataset.id}`}
                    className={`block rounded-md border px-3 py-2 text-sm transition ${
                      dataset.id === selectedDatasetId
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {dataset.name}
                  </Link>
                ))}
              </div>
            )}

            {selectedDataset ? (
              <>
                <p className="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('dataset.view.page.versions')}
                </p>
                <div className="mt-2 space-y-2">
                  {selectedDataset.versions.map((version) => (
                    <Link
                      key={version.id}
                      href={`/datasets/view?datasetId=${selectedDataset.id}&versionId=${version.id}`}
                      className={`block rounded-md border px-3 py-2 text-xs transition ${
                        version.id === selectedVersionId
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {version.name}
                    </Link>
                  ))}
                </div>
              </>
            ) : null}
          </aside>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{t('dataset.view.page.preview_title')}</h3>
              {selectedDataset ? (
                <button
                  type="button"
                  onClick={() => setIsUpdateFormOpen((current) => !current)}
                  className="inline-flex h-9 items-center rounded-lg border px-3 text-sm"
                >
                  {isUpdateFormOpen
                    ? t('dataset.view.page.actions.cancel_update')
                    : t('dataset.view.page.actions.open_update')}
                </button>
              ) : null}
            </div>

            {isUpdateFormOpen && selectedDataset ? (
              <Form
                action={`/datasets/${selectedDataset.id}/version`}
                method="post"
                encType="multipart/form-data"
                className="mt-4 rounded-lg border border-dashed p-4"
              >
                {({ processing }) => (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('dataset.view.page.update.intro')}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field name="version">
                        <label className="grid gap-2">
                          <span className="text-sm font-medium">
                            {t('dataset.view.page.update.version.label')}
                          </span>
                          <input
                            name="version"
                            type="text"
                            defaultValue={suggestedVersionName}
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                          />
                        </label>
                        <FieldError />
                      </Field>

                      <Field name="file">
                        <label className="grid gap-2">
                          <span className="text-sm font-medium">
                            {t('dataset.view.page.update.file.label')}
                          </span>
                          <input
                            name="file"
                            type="file"
                            accept=".csv,text/csv"
                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm file:mr-3 file:h-full file:border-0 file:bg-transparent file:text-sm file:font-medium"
                            required
                          />
                        </label>
                        <FieldError />
                      </Field>
                    </div>

                    <Field name="description">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium">
                          {t('dataset.view.page.update.description.label')}
                        </span>
                        <textarea
                          name="description"
                          rows={3}
                          placeholder={t('dataset.view.page.update.description.placeholder')}
                          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                        />
                      </label>
                      <FieldError />
                    </Field>

                    <button
                      type="submit"
                      disabled={processing}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {processing
                        ? t('dataset.view.page.update.actions.saving')
                        : t('dataset.view.page.update.actions.submit')}
                    </button>
                  </div>
                )}
              </Form>
            ) : null}

            {successMessage ? (
              <p className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            {previewPath ? (
              <p className="mt-2 text-xs font-mono break-all text-muted-foreground">{previewPath}</p>
            ) : null}

            {previewError ? (
              <p className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {previewError}
              </p>
            ) : null}

            {!previewError && previewHeaders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{t('dataset.view.page.no_content')}</p>
            ) : null}

            {!previewError && previewHeaders.length > 0 ? (
              <div className="mt-4 overflow-auto rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      {previewHeaders.map((header, index) => (
                        <th key={`${header}-${index}`} className="px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rowIndex) => (
                      <tr key={`row-${rowIndex}`} className="border-t">
                        {previewHeaders.map((_, colIndex) => (
                          <td key={`cell-${rowIndex}-${colIndex}`} className="px-3 py-2 align-top">
                            {row[colIndex] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <div className="mt-6">
              <h4 className="text-base font-semibold">{t('dataset.view.page.readme_title')}</h4>

              {readmeError ? (
                <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                  {readmeError}
                </p>
              ) : null}

              {!readmeError && !readmeContent ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t('dataset.view.page.no_readme')}
                </p>
              ) : null}

              {!readmeError && readmeContent ? (
                <pre className="mt-3 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-6">
                  {readmeContent}
                </pre>
              ) : null}
            </div>
          </section>
        </div>
      </Main>
    </AppLayout>
  )
}
