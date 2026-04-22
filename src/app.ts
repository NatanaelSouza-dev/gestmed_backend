import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import { ZodError } from 'zod'
import { jwtPlugin } from './shared/plugins/jwt.plugin'
import { adminAuthRoutes } from './modules/auth/admin/admin-auth.routes'
import { patientAuthRoutes } from './modules/auth/patient/patient-auth.routes'
import { patientRoutes } from './modules/patients/patient.routes'
import { examRoutes } from './modules/exams/exam.routes'
import { AppError } from './shared/errors/app-error'

export function buildApp() {
	const app = Fastify({ logger: false })

	app.register(cors)
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
