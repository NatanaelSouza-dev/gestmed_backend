import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import fs from 'fs'
import { ZodError } from 'zod'
import { jwtPlugin } from './shared/plugins/jwt.plugin'
import { adminAuthRoutes } from './modules/auth/admin/admin-auth.routes'
import { patientAuthRoutes } from './modules/auth/patient/patient-auth.routes'
import { patientRoutes } from './modules/patients/patient.routes'
import { examRoutes } from './modules/exams/exam.routes'
import { AppError } from './shared/errors/app-error'
import { getPublicAssets } from './shared/lib/branding'

export function buildApp() {
	const app = Fastify({ logger: false })
	const allowedOrigin = process.env.PATIENT_ACCESS_URL

	app.register(cors, {
		origin: allowedOrigin ?? false,
		credentials: true,
	})
	app.register(multipart, {
		limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
	})
	app.register(rateLimit, {
		global: true,
		max: 100,
		timeWindow: '1 minute',
		errorResponseBuilder: () => ({
			message: 'Muitas requisições. Tente novamente em instantes.',
		}),
	})
	app.register(jwtPlugin)

	app.get('/public-assets/:filename', async (request, reply) => {
		const { filename } = request.params as { filename: string }
		const files = getPublicAssets()
		const file = files[filename as keyof typeof files]
		if (!file) {
			return reply.status(404).send({ message: 'Arquivo nao encontrado' })
		}

		if (!fs.existsSync(file.path)) {
			return reply.status(404).send({ message: 'Arquivo nao encontrado' })
		}

		return reply.type(file.contentType).send(fs.createReadStream(file.path))
	})

	app.setErrorHandler((error, _request, reply) => {
		if (error instanceof AppError) {
			return reply.status(error.statusCode).send({ message: error.message })
		}

		if (error instanceof ZodError) {
			return reply
				.status(400)
				.send({ message: 'Dados inválidos', errors: error.errors })
		}

		app.log.error(error)
		return reply.status(500).send({ message: 'Erro interno do servidor' })
	})

	app.register(adminAuthRoutes, { prefix: '/auth/admin' })
	app.register(patientAuthRoutes, { prefix: '/auth/patient' })
	app.register(patientRoutes, { prefix: '/patients' })
	app.register(examRoutes, { prefix: '/exams' })

	return app
}
