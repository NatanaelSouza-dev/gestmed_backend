import { randomBytes } from 'crypto'
import { prisma } from '../../../shared/lib/prisma'
import { sendMagicLink } from '../../../shared/lib/resend'
import { AppError } from '../../../shared/errors/app-error'

const EXPIRY_MINUTES = 15

export async function requestMagicLink(email: string): Promise<void> {
	const admin = await prisma.admin.findUnique({ where: { email } })
	if (!admin) throw new AppError('E-mail não cadastrado', 404)

	const token = randomBytes(32).toString('hex')
	const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000)

	await prisma.magicLink.create({
		data: { token, adminId: admin.id, expiresAt },
	})

	const link = `${process.env.MAGIC_LINK_BASE_URL}?token=${token}`
	await sendMagicLink(email, link)
}

export async function verifyMagicLink(token: string): Promise<string> {
	const magicLink = await prisma.magicLink.findUnique({
		where: { token },
		include: { admin: true },
	})

	if (!magicLink) throw new AppError('Link inválido', 401)
	if (magicLink.usedAt) throw new AppError('Link já utilizado', 401)
	if (magicLink.expiresAt < new Date()) throw new AppError('Link expirado', 401)

	await prisma.magicLink.update({
		where: { id: magicLink.id },
		data: { usedAt: new Date() },
	})

	return magicLink.admin.id
}
