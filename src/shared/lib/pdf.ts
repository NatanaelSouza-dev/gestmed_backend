import PDFDocument from 'pdfkit'

interface PatientCredentials {
	name: string
	cpf: string
	password: string
	accessUrl: string
}

export function generateCredentialsPDF(
	data: PatientCredentials,
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({ size: 'A4', margin: 60 })
		const chunks: Buffer[] = []

		doc.on('data', (chunk: Buffer) => chunks.push(chunk))
		doc.on('end', () => resolve(Buffer.concat(chunks)))
		doc.on('error', reject)

		doc
			.fontSize(24)
			.font('Helvetica-Bold')
			.text('GestMed Exames', { align: 'center' })
			.moveDown(0.3)
			.fontSize(13)
			.font('Helvetica')
			.text('Guia de acesso aos seus exames', { align: 'center' })
			.moveDown(2)

		doc
			.fontSize(14)
			.font('Helvetica-Bold')
			.text('Seus dados de acesso:')
			.moveDown(0.8)

		doc
			.fontSize(13)
			.font('Helvetica')
			.text(`Nome:  ${data.name}`)
			.moveDown(0.4)
			.text(`CPF:   ${formatCpf(data.cpf)}`)
			.moveDown(0.4)
			.text(`Senha: ${data.password}`)
			.moveDown(2)

		doc
			.fontSize(14)
			.font('Helvetica-Bold')
			.text('Como acessar seus exames:')
			.moveDown(0.8)

		doc
			.fontSize(12)
			.font('Helvetica')
			.text('1.  Abra um navegador de internet no seu celular ou computador.')
			.moveDown(0.4)
			.text(`2.  Acesse o endereço: ${data.accessUrl}`)
			.moveDown(0.4)
			.text('3.  Digite seu CPF (somente os números, sem pontos ou traços).')
			.moveDown(0.4)
			.text('4.  Digite a senha indicada acima.')
			.moveDown(0.4)
			.text('5.  Clique em "Entrar" para visualizar seus exames.')
			.moveDown(2.5)

		doc
			.fontSize(11)
			.fillColor('#555555')
			.text('Guarde este documento em local seguro.', { align: 'center' })
			.moveDown(0.3)
			.text('Em caso de dúvidas, entre em contato com a clínica.', {
				align: 'center',
			})

		doc.end()
	})
}

function formatCpf(cpf: string): string {
	return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}
