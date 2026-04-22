import type { FastifyRequest, FastifyReply } from 'fastify'
import { createPatientSchema, updatePatientSchema } from './patient.schema'
import * as service from './patient.service'

export async function createPatientController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const data = createPatientSchema.parse(request.body)
	const pdfBuffer = await service.createPatient(data)

	return reply
		.header('Content-Type', 'application/pdf')
		.header(
			'Content-Disposition',
			'attachment; filename="credenciais-paciente.pdf"',
		)
		.status(201)
		.send(pdfBuffer)
}

export async function updatePatientController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const data = updatePatientSchema.parse(request.body)
	const patient = await service.updatePatient(request.params.id, data)
	return reply.status(200).send(patient)
}

export async function regeneratePatientCredentialsController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const pdfBuffer = await service.regeneratePatientCredentials(request.params.id)

	return reply
		.header('Content-Type', 'application/pdf')
		.header(
			'Content-Disposition',
			'attachment; filename="credenciais-paciente.pdf"',
		)
		.status(200)
		.send(pdfBuffer)
}

export async function listPatientsController(
	_request: FastifyRequest,
	reply: FastifyReply,
) {
	const patients = await service.listPatients()
	return reply.status(200).send(patients)
}

export async function getPatientController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const patient = await service.getPatient(request.params.id)
	return reply.status(200).send(patient)
}
