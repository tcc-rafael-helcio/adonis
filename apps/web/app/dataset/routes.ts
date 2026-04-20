/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const DatasetsController = () => import('#app/dataset/controllers/datasets_controller')

router
  .get('/datasets/view', [DatasetsController, 'viewer'])
  .middleware(middleware.auth())
  .as('datasets.viewer')

router
  .post('/datasets/:id/version', [DatasetsController, 'addVersion'])
  .middleware(middleware.auth())
  .as('datasets.version.store')

router
  .resource('/datasets', DatasetsController)
  .only(['index', 'store'])
  .use('*', middleware.auth())
  .as('datasets')
