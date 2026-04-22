import type { FastifyRequest, FastifyReply } from 'fastify'
import { patientLoginSchema } from './patient-auth.schema'
import * as service from './patient-auth.service'

export async function loginPatientController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { cpf, password } = patientLoginSchema.parse(request.body)
	const patientId = await service.loginPatient(cpf, password)

	const token = await reply.jwtSign({ sub: patientId, role: 'patient' })
	return reply.status(200).send({ token })
}
