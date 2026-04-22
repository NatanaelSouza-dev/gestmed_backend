import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMagicLink(
	email: string,
	link: string,
): Promise<void> {
	await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL!,
		to: email,
		subject: 'Seu link de acesso - GestMed Exames',
		html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px 20px;color:#1f2937">
        <p style="margin:0 0 16px">
          Clique no botão abaixo para acessar o painel administrativo:
        </p>
        <a href="${link}"
           style="display:inline-block;background:#0066cc;color:#fff;padding:12px 28px;
                  text-decoration:none;border-radius:6px;font-weight:bold;margin-top:8px">
          Acessar painel
        </a>
        <p style="color:#666;font-size:13px;margin-top:24px">
          Este link expira em <strong>15 minutos</strong>.<br>
          Se você não solicitou este acesso, ignore este e-mail.
        </p>
      </div>
    `,
		text: `Clique no link para acessar o painel administrativo: ${link}\n\nEste link expira em 15 minutos.\nSe você não solicitou este acesso, ignore este e-mail.`,
	})
}
