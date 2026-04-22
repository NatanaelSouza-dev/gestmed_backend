import type { FastifyRequest, FastifyReply } from 'fastify'
import { createExamSchema } from './exam.schema'
import * as service from './exam.service'
import { AppError } from '../../shared/errors/app-error'

export async function uploadExamController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const fields: Record<string, string> = {}
	let fileBuffer: Buffer | null = null

	for await (const part of request.parts()) {
		if (part.type === 'file') {
			if (part.mimetype !== 'application/pdf') {
				throw new AppError('Apenas arquivos PDF são aceitos')
			}
			fileBuffer = await part.toBuffer()
		} else {
			fields[part.fieldname] = part.value as string
		}
	}

	if (!fileBuffer) throw new AppError('Arquivo PDF obrigatório')

	const data = createExamSchema.parse(fields)
	const exam = await service.uploadExam(data, fileBuffer)

	return reply.status(201).send(exam)
}

export async function listExamsController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { patientId } = request.query as { patientId?: string }
	const exams = await service.listExams(patientId)
	return reply.status(200).send(exams)
}

export async function listMyExamsController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const exams = await service.listMyExams(request.user.sub)
	return reply.status(200).send(exams)
}

export async function downloadExamController(
	request: FastifyRequest<{ Params: { id: string } }>,
	reply: FastifyReply,
) {
	const { sub, role } = request.user
	const patientId = role === 'patient' ? sub : undefined
	const result = await service.getExamDownloadUrl(request.params.id, patientId)
	return reply.status(200).send(result)
}
