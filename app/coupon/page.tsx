'use client'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store'
import { generateCouponPDF, downloadPDF } from '@/lib/generateCoupon'
import { getActiveCycle, createOrder } from '@/lib/db'

const DEMO_ORDER = {
  ref: 'SG-2025-0047',
  date: '06/10/2025',
  cycle: 'Octobre 2025',
  client: { name: 'Adjobi Kossi', phone: '+228 90 00 00 00' },
  items: [
    { emoji: '🧴', bg: '#FFF0E6', name: 'Sérum Vitamine C 30ml', variant: 'Taille : 30ml · Beige', qty: 2, unitPrice: 4500 },
    { emoji: '🎧', bg: '#E8F0FE', name: 'Écouteurs Bluetooth TWS', variant: 'Couleur : Noir', qty: 1, unitPrice: 18000 },
    { emoji: '👗', bg: '#FEF3E8', name: 'Robe florale M - Rose', variant: 'Taille : M · Motif floral rose', qty: 2, unitPrice: 14500 },
  ],
}

function fmt(n: number) { return n.toLocaleString('fr-FR') }
const today = new Date().toLocaleDateString('fr-FR')

export default function CouponPage() {
  const cartItems = useCartStore(s => s.items)
  const cartTotal = useCartStore(s => s.total())
  const clearCart = useCartStore(s => s.clearCart)

  const [pdfLoading, setPdfLoading] = useState(false)
  const [orderSaved, setOrderSaved] = useState(false)
  const [orderRef, setOrderRef] = useState(DEMO_ORDER.ref)
  const [cycleId, setCycleId] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [formDone, setFormDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const hasCartItems = cartItems.length > 0

  const displayItems = hasCartItems
    ? cartItems.map(i => ({ emoji: i.emoji, bg: i.bg, name: i.name, variant: i.color ?? '', qty: i.quantity, unitPrice: i.price }))
    : DEMO_ORDER.items

  const total = hasCartItems ? cartTotal : DEMO_ORDER.items.reduce((s, i) => s + i.qty * i.unitPrice, 0)

  useEffect(() => {
    getActiveCycle().then(c => { if (c) setCycleId(c.id) }).catch(() => {})
  }, [])

  const handleConfirmOrder = async () => {
    if (!clientName.trim() || !clientPhone.trim()) {
      setSaveError('Merci de renseigner votre nom et téléphone.')
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      if (hasCartItems && cycleId) {
        const order = await createOrder({
          cycle_id: cycleId,
          customer_name: clientName.trim(),
          customer_phone: clientPhone.trim(),
          items: cartItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, color: i.color, unit_price: i.price })),
          total_amount: cartTotal,
        })
        if (order) {
          setOrderRef((order as { reference?: string; id: string }).reference ?? order.id)
          clearCart()
          setOrderSaved(true)
        }
      }
      setFormDone(true)
    } catch {
      setSaveError('Erreur lors de l\'enregistrement. Continuez quand même.')
      setFormDone(true)
    } finally {
      setSaving(false)
    }
  }

  const displayName = formDone ? clientName || DEMO_ORDER.client.name : DEMO_ORDER.client.name
  const displayPhone = formDone ? clientPhone || DEMO_ORDER.client.phone : DEMO_ORDER.client.phone
  const displayRef = formDone ? orderRef : DEMO_ORDER.ref

  const waMessage = encodeURIComponent(
    `Bonjour SAFEL GROUP,\n\nJe vous envoie ma preuve de paiement pour la commande ${displayRef}.\n\nMontant : ${fmt(total)} FCFA\nNom : ${displayName}\n\nMerci.`
  )
  const waUrl = `https://wa.me/22896045369?text=${waMessage}`

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      const bytes = await generateCouponPDF({
        reference: displayRef,
        customerName: displayName,
        customerPhone: displayPhone,
        items: displayItems.map(i => ({ name: i.name, qty: i.qty, unitPrice: i.unitPrice, color: i.variant })),
        totalMarchandises: total,
        fraisDouane: 0,
        cycle: 'Octobre 2025',
        date: today,
      })
      downloadPDF(bytes, `coupon-${displayRef}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <h2 className="section-title">Votre coupon de commande</h2>
      <p className="section-sub">Ce document est votre preuve de commande. Envoyez-le avec votre capture de paiement sur WhatsApp.</p>

      {/* Formulaire client si panier réel et pas encore validé */}
      {hasCartItems && !formDone && (
        <div style={{ background: 'var(--white)', border: '2px solid var(--orange)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24, maxWidth: 500 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Confirmer votre commande</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>Renseignez vos coordonnées pour enregistrer votre commande et générer le coupon.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom complet</div>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Prénom Nom" style={{ width: '100%', height: 40, border: '1.5px solid var(--border-2)', borderRadius: 8, padding: '0 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.04em' }}>Téléphone (WhatsApp de préférence)</div>
              <input type="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+228 XX XX XX XX" style={{ width: '100%', height: 40, border: '1.5px solid var(--border-2)', borderRadius: 8, padding: '0 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {saveError && <div style={{ fontSize: 12, color: '#E53E3E' }}>{saveError}</div>}
            <button onClick={handleConfirmOrder} disabled={saving} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, height: 44, fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? 'Enregistrement…' : 'Confirmer et générer le coupon →'}
            </button>
          </div>
        </div>
      )}

      {(formDone || !hasCartItems) && orderSaved && (
        <div style={{ background: '#F0FFF4', border: '1.5px solid #68D391', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#276749', display: 'flex', gap: 8 }}>
          ✅ Commande <strong>{orderRef}</strong> enregistrée. Envoyez le paiement via WhatsApp pour confirmation.
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* COUPON */}
        <div style={{ background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 500, position: 'relative', overflow: 'hidden', opacity: hasCartItems && !formDone ? .45 : 1 }}>
          {/* Watermark */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', fontSize: 32, fontWeight: 900, color: 'rgba(232,114,12,.12)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '.15em' }}>
            EN ATTENTE DE PAIEMENT
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--orange)' }}>SAFEL GROUP</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Précommandes · Lomé, Togo</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{displayRef}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Émis le {today}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Cycle : Octobre 2025</div>
            </div>
          </div>

          {/* Client */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>CLIENT</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{displayPhone}</div>
          </div>

          {/* Articles */}
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th colSpan={2} style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>Article</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>Qté</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>P.U.</th>
                <th style={{ textAlign: 'right', padding: '6px 4px', color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, i) => (
                <tr key={i}>
                  <td style={{ width: 40, padding: '8px 4px', borderBottom: '1px solid var(--bg)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{item.emoji}</div>
                  </td>
                  <td style={{ padding: '8px 4px 8px 8px', borderBottom: '1px solid var(--bg)' }}>
                    <div style={{ fontWeight: 500, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{item.variant}</div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid var(--bg)', whiteSpace: 'nowrap' }}>{item.qty}</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid var(--bg)', whiteSpace: 'nowrap' }}>{fmt(item.unitPrice)}</td>
                  <td style={{ textAlign: 'right', padding: '8px 4px', borderBottom: '1px solid var(--bg)', whiteSpace: 'nowrap', fontWeight: 600 }}>{fmt(item.qty * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-2)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total marchandises</span>
            <span style={{ color: 'var(--orange)' }}>{fmt(total)} FCFA</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', borderTop: '1px dashed var(--border-2)', marginTop: 10, paddingTop: 10 }}>
            Frais de douane : fixés à l&apos;arrivée à Lomé — notifié sur votre compte
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <div style={{ width: 56, height: 56, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.3 }}>QR<br/>Code</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 12 }}>
            SAFEL GROUP · +228 70 62 67 96 · Lomé, Togo
          </div>
        </div>

        {/* Actions */}
        <div style={{ flex: 1, minWidth: 240, opacity: hasCartItems && !formDone ? .45 : 1, pointerEvents: hasCartItems && !formDone ? 'none' : 'auto' }}>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Étapes suivantes</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 16 }}>
              1. Téléchargez ou photographiez ce coupon.<br/>
              2. Envoyez votre preuve de paiement (Moov Money ou Mixx by Yas) sur WhatsApp.<br/>
              3. Nous validons votre paiement sous 24h.<br/>
              4. Votre commande passe en statut <strong>Payé</strong> et votre coupon est mis à jour.
            </div>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn-cta" style={{ textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="white" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              Envoyer sur WhatsApp
            </a>
          </div>
          <button onClick={handleDownloadPDF} disabled={pdfLoading} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 22, fontSize: 14, fontWeight: 500, color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: pdfLoading ? 'wait' : 'pointer', background: 'var(--white)', opacity: pdfLoading ? .7 : 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            {pdfLoading ? 'Génération…' : 'Télécharger le PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
