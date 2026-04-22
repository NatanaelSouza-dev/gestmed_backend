import type { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		await request.jwtVerify()
	} catch {
		return reply.status(401).send({ message: 'Não autorizado' })
	}
}

export async function requireAdmin(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		await request.jwtVerify()
	} catch {
		return reply.status(401).send({ message: 'Não autorizado' })
	}

	if (request.user.role !== 'admin') {
		return reply
			.status(403)
			.send({ message: 'Acesso restrito a administradores' })
	}
}

export async function requirePatient(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	try {
		await request.jwtVerify()
	} catch {
		return reply.status(401).send({ message: 'Não autorizado' })
	}

	if (request.user.role !== 'patient') {
		return reply.status(403).send({ message: 'Acesso restrito a pacientes' })
	}
}
