import type { InertiaProps } from '#core/ui/types'
import { Field, FieldError, Form } from '#common/ui/components/form'
import useFlashMessage from '#common/ui/hooks/use_flash_message'
import { Link } from '@adonisjs/inertia/react'

import AppLayout from '#common/ui/components/app_layout'
import Heading from '#common/ui/components/heading'
import { Main } from '#common/ui/components/main'

import { useTranslation } from '#common/ui/hooks/use_translation'

type PageProps = InertiaProps<{
}>

export default function ListDatasetsPage({}: PageProps) {
  const { t } = useTranslation()
  const successMessage = useFlashMessage('success')
  const errorMessage = useFlashMessage('error')

  return (
    <AppLayout breadcrumbs={[{ label: t('dataset.index.page.breadcrumbs.dataset') }]}>
      <Main>
        <Heading
          title={t('dataset.index.page.title')}
          description={t('dataset.index.page.description')}
        />

        <div className="grid gap-6">
          <Form route="datasets.store" encType="multipart/form-data" className="space-y-6">
            {({ processing }) => (
              <section className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold">{t('dataset.index.page.form.title')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('dataset.index.page.form.intro')}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-end">
                    <Link
                      href="/datasets/view"
                      className="inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium"
                    >
                      {t('dataset.index.page.actions.open_viewer')}
                    </Link>
                  </div>

                  <Field name="name">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium">
                        {t('dataset.index.page.form.name.label')}
                      </span>
                      <input
                        name="name"
                        type="text"
                        placeholder={t('dataset.index.page.form.name.placeholder')}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                        required
                      />
                    </label>
                    <FieldError />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field name="version">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium">
                          {t('dataset.index.page.form.version.label')}
                        </span>
                        <input
                          name="version"
                          type="text"
                          defaultValue="V1"
                          className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
                        />
                      </label>
                      <FieldError />
                    </Field>

                    <Field name="file">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium">
                          {t('dataset.index.page.form.file.label')}
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
                        {t('dataset.index.page.form.description.label')}
                      </span>
                      <textarea
                        name="description"
                        rows={4}
                        placeholder={t('dataset.index.page.form.description.placeholder')}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
                      />
                    </label>
                    <FieldError />
                  </Field>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={processing}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
                    >
                      {processing
                        ? t('dataset.index.page.form.actions.saving')
                        : t('dataset.index.page.form.actions.submit')}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {t('dataset.index.page.form.note')}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </Form>

          {successMessage ? (
            <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Main>
    </AppLayout>
  )
}
