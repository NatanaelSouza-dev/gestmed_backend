import { z } from 'zod'

export const createPatientSchema = z.object({
	name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
	cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos numéricos'),
	birthDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
})

export const updatePatientSchema = z.object({
	name: z.string().min(2).optional(),
	birthDate: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
