import { PDFDocument, rgb, StandardFonts, degrees, type PDFImage } from 'pdf-lib'

interface CouponData {
  reference: string
  customerName: string
  customerPhone: string
  items: { name: string; qty: number; unitPrice: number; color?: string; imageUrl?: string }[]
  totalMarchandises: number
  fraisDouane: number
  cycle: string
  date: string
}

async function fetchEmbeddableImage(doc: PDFDocument, url: string): Promise<PDFImage | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const bytes = new Uint8Array(buf)
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) return await doc.embedJpg(bytes)
    if (bytes[0] === 0x89 && bytes[1] === 0x50) return await doc.embedPng(bytes)
    return null
  } catch {
    return null
  }
}

function fmt(n: number) { return n.toLocaleString('fr-FR').replace(/ /g, ' ').replace(/ /g, ' ') + ' FCFA' }

export async function generateCouponPDF(data: CouponData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()

  // Pré-charger les miniatures (JPG/PNG uniquement, WebP ignoré silencieusement)
  const thumbnails: (PDFImage | null)[] = await Promise.all(
    data.items.map(item => item.imageUrl ? fetchEmbeddableImage(doc, item.imageUrl) : Promise.resolve(null))
  )
  const page = doc.addPage([595, 842])

  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const helvetica = await doc.embedFont(StandardFonts.Helvetica)

  const orange = rgb(0.91, 0.447, 0.047)
  const dark = rgb(0.102, 0.102, 0.102)
  const gray = rgb(0.45, 0.45, 0.45)
  const lightGray = rgb(0.94, 0.94, 0.94)
  const white = rgb(1, 1, 1)

  const W = 595

  // Header band
  page.drawRectangle({ x: 0, y: 762, width: W, height: 80, color: orange })

  // Logo mark
  page.drawRectangle({ x: 40, y: 784, width: 36, height: 36, color: white })
  page.drawText('SG', { x: 48, y: 795, size: 14, font: helveticaBold, color: orange })

  page.drawText('SAFEL GROUP', { x: 86, y: 806, size: 16, font: helveticaBold, color: white })
  page.drawText('Precommandes Chine - Lome', { x: 86, y: 788, size: 9, font: helvetica, color: rgb(1, 0.88, 0.76) })

  page.drawText(data.reference, { x: W - 190, y: 806, size: 14, font: helveticaBold, color: white })
  page.drawText(`Emis le ${data.date}`, { x: W - 190, y: 788, size: 9, font: helvetica, color: rgb(1, 0.88, 0.76) })

  // Watermark diagonal
  page.drawText('EN ATTENTE DE PAIEMENT', {
    x: 80, y: 400, size: 38, font: helveticaBold,
    color: rgb(0.91, 0.447, 0.047),
    opacity: 0.06,
    rotate: degrees(30),
  })

  let y = 730

  // Client section
  page.drawRectangle({ x: 40, y: y - 60, width: W - 80, height: 68, color: lightGray })
  page.drawText('CLIENT', { x: 52, y: y - 8, size: 8, font: helveticaBold, color: gray })
  page.drawText(data.customerName, { x: 52, y: y - 22, size: 13, font: helveticaBold, color: dark })
  page.drawText(data.customerPhone, { x: 52, y: y - 38, size: 10, font: helvetica, color: gray })
  page.drawText(`Cycle : ${data.cycle}`, { x: 52, y: y - 52, size: 9, font: helvetica, color: gray })

  y -= 80

  // Table header
  page.drawRectangle({ x: 40, y: y - 20, width: W - 80, height: 22, color: dark })
  page.drawText('Article', { x: 52, y: y - 14, size: 9, font: helveticaBold, color: white })
  page.drawText('Couleur / Taille', { x: 260, y: y - 14, size: 9, font: helveticaBold, color: white })
  page.drawText('Qte', { x: 390, y: y - 14, size: 9, font: helveticaBold, color: white })
  page.drawText('Prix unit.', { x: 430, y: y - 14, size: 9, font: helveticaBold, color: white })
  page.drawText('Sous-total', { x: 490, y: y - 14, size: 9, font: helveticaBold, color: white })

  y -= 26

  data.items.forEach((item, i) => {
    const thumb = thumbnails[i]
    const rowH = 26
    if (i % 2 === 0) {
      page.drawRectangle({ x: 40, y: y - rowH + 6, width: W - 80, height: rowH, color: rgb(0.97, 0.97, 0.97) })
    }
    // Miniature (18×18) si disponible
    if (thumb) {
      page.drawImage(thumb, { x: 52, y: y - rowH + 10, width: 18, height: 18 })
    }
    const textX = thumb ? 74 : 52
    const maxName = item.name.length > 30 ? item.name.slice(0, 28) + '...' : item.name
    page.drawText(maxName, { x: textX, y: y - 10, size: 9, font: helvetica, color: dark })
    page.drawText(item.color ?? '-', { x: 260, y: y - 10, size: 9, font: helvetica, color: gray })
    page.drawText(String(item.qty), { x: 400, y: y - 10, size: 9, font: helvetica, color: dark })
    page.drawText(fmt(item.unitPrice), { x: 430, y: y - 10, size: 9, font: helvetica, color: dark })
    page.drawText(fmt(item.unitPrice * item.qty), { x: 490, y: y - 10, size: 9, font: helveticaBold, color: dark })
    y -= rowH
  })

  y -= 12

  // Separator
  page.drawLine({ start: { x: 40, y }, end: { x: W - 40, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) })
  y -= 20

  // Totals
  const totalFinal = data.totalMarchandises + data.fraisDouane

  page.drawText('Total marchandises', { x: 360, y, size: 10, font: helvetica, color: gray })
  page.drawText(fmt(data.totalMarchandises), { x: 490, y, size: 10, font: helveticaBold, color: dark })
  y -= 16

  if (data.fraisDouane > 0) {
    page.drawText('Frais de douane', { x: 360, y, size: 10, font: helvetica, color: gray })
    page.drawText(fmt(data.fraisDouane), { x: 490, y, size: 10, font: helveticaBold, color: dark })
    y -= 16
  }

  page.drawRectangle({ x: 340, y: y - 8, width: W - 380, height: 26, color: orange })
  page.drawText('TOTAL A PAYER', { x: 360, y: y - 2, size: 10, font: helveticaBold, color: white })
  page.drawText(fmt(totalFinal), { x: 490, y: y - 2, size: 11, font: helveticaBold, color: white })

  y -= 40

  // WhatsApp block
  page.drawRectangle({ x: 40, y: y - 56, width: W - 80, height: 62, color: rgb(0.94, 1, 0.94) })
  page.drawText('Envoyer ce recu via WhatsApp', { x: 52, y: y - 12, size: 10, font: helveticaBold, color: rgb(0.1, 0.55, 0.25) })
  page.drawText('Envoyez ce document a : wa.me/22896045369', { x: 52, y: y - 26, size: 9, font: helvetica, color: gray })
  page.drawText(`Objet : Paiement commande ${data.reference} - ${fmt(totalFinal)}`, { x: 52, y: y - 40, size: 9, font: helvetica, color: gray })
  page.drawText('Votre commande sera confirmee des reception du paiement.', { x: 52, y: y - 54, size: 8, font: helvetica, color: gray })

  // Footer
  page.drawLine({ start: { x: 40, y: 60 }, end: { x: W - 40, y: 60 }, thickness: 0.5, color: lightGray })
  page.drawText('SAFEL GROUP - Lome, Togo - wa.me/22896045369', {
    x: W / 2 - 130, y: 44, size: 8, font: helvetica, color: gray,
  })
  page.drawText('Ce recu est valable pour le cycle en cours uniquement.', {
    x: W / 2 - 130, y: 30, size: 8, font: helvetica, color: lightGray,
  })

  return doc.save()
}

export function downloadPDF(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
