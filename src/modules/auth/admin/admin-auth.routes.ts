import type { FastifyInstance } from 'fastify'
import {
	requestMagicLinkController,
	verifyMagicLinkController,
} from './admin-auth.controller'

export async function adminAuthRoutes(app: FastifyInstance) {
	app.post(
		'/request-link',
		{
			config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
		},
		requestMagicLinkController,
	)

	app.get(
		'/verify',
		{
			config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
		},
		verifyMagicLinkController,
	)
}
