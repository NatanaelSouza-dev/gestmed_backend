import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../shared/lib/prisma'
import { generateCredentialsPDF } from '../../shared/lib/pdf'
import { AppError } from '../../shared/errors/app-error'
import type { CreatePatientInput, UpdatePatientInput } from './patient.schema'

// Caracteres sem ambiguidade visual (sem 0/O, 1/I) — facilita leitura para idosos
const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generatePassword(): string {
	return Array.from(randomBytes(8))
		.map((b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length])
		.join('')
}

export async function createPatient(data: CreatePatientInput): Promise<Buffer> {
	const existing = await prisma.patient.findUnique({ where: { cpf: data.cpf } })
	if (existing) throw new AppError('CPF já cadastrado')

	const rawPassword = generatePassword()
	const hashedPassword = await bcrypt.hash(rawPassword, 10)

	const patient = await prisma.patient.create({
		data: {
			name: data.name,
			cpf: data.cpf,
			birthDate: new Date(data.birthDate),
			password: hashedPassword,
		},
	})

	const pdf = await generateCredentialsPDF({
		name: patient.name,
		cpf: patient.cpf,
		password: rawPassword,
		accessUrl: process.env.PATIENT_ACCESS_URL!,
	})

	return pdf
}

export async function updatePatient(id: string, data: UpdatePatientInput) {
	const patient = await prisma.patient.findUnique({ where: { id } })
	if (!patient) throw new AppError('Paciente não encontrado', 404)

	return prisma.patient.update({
		where: { id },
		data: {
			...(data.name && { name: data.name }),
			...(data.birthDate && { birthDate: new Date(data.birthDate) }),
		},
		select: {
			id: true,
			name: true,
			cpf: true,
			birthDate: true,
			updatedAt: true,
		},
	})
}

export async function listPatients() {
	return prisma.patient.findMany({
		select: {
			id: true,
			name: true,
			cpf: true,
			birthDate: true,
			createdAt: true,
		},
		orderBy: { name: 'asc' },
	})
}

export async function getPatient(id: string) {
	const patient = await prisma.patient.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			cpf: true,
			birthDate: true,
			createdAt: true,
		},
	})
	if (!patient) throw new AppError('Paciente não encontrado', 404)
	return patient
}
