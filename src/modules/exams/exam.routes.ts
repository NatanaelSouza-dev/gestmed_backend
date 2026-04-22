import type { FastifyInstance } from 'fastify'
import {
	requireAdmin,
	requirePatient,
	authenticate,
} from '../../shared/hooks/authenticate'
import {
	uploadExamController,
	listExamsController,
	listMyExamsController,
	downloadExamController,
} from './exam.controller'

export async function examRoutes(app: FastifyInstance) {
	app.post('/', { onRequest: [requireAdmin] }, uploadExamController)
	app.get('/', { onRequest: [requireAdmin] }, listExamsController)

	app.get('/my', { onRequest: [requirePatient] }, listMyExamsController)

	// Admin e paciente podem baixar — o service valida que paciente só acessa seu próprio exame
	app.get<{ Params: { id: string } }>(
		'/:id/download',
		{ onRequest: [authenticate] },
		downloadExamController,
	)
}
