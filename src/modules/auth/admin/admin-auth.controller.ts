import type { FastifyRequest, FastifyReply } from 'fastify'
import {
	requestMagicLinkSchema,
	verifyMagicLinkSchema,
} from './admin-auth.schema'
import * as service from './admin-auth.service'

export async function requestMagicLinkController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { email } = requestMagicLinkSchema.parse(request.body)
	await service.requestMagicLink(email)
	return reply.status(200).send({ message: 'Link enviado para o e-mail' })
}

export async function verifyMagicLinkController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { token } = verifyMagicLinkSchema.parse(request.query)
	const adminId = await service.verifyMagicLink(token)

	const jwtToken = await reply.jwtSign({ sub: adminId, role: 'admin' })
	return reply.status(200).send({ token: jwtToken })
}
