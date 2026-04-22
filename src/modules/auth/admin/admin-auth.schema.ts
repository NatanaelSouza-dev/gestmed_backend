import { z } from 'zod'

export const requestMagicLinkSchema = z.object({
	email: z.string().email('E-mail inválido'),
})

export const verifyMagicLinkSchema = z.object({
	token: z.string().min(1, 'Token inválido'),
})

export type RequestMagicLinkInput = z.infer<typeof requestMagicLinkSchema>
export type VerifyMagicLinkInput = z.infer<typeof verifyMagicLinkSchema>
