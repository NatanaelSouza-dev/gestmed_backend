import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
	const name = process.env.ADMIN_NAME
	const email = process.env.ADMIN_EMAIL
	const cpf = process.env.ADMIN_CPF

	if (!name || !email || !cpf) {
		throw new Error(
			'ADMIN_NAME, ADMIN_EMAIL e ADMIN_CPF devem estar definidos no .env',
		)
	}

	await prisma.admin.upsert({
		where: { email },
		update: { name, cpf },
		create: { name, email, cpf },
	})

	console.log(`Admin criado: ${name} (${email})`)
}

main()
	.catch(console.error)
	.finally(() => prisma.$disconnect())
