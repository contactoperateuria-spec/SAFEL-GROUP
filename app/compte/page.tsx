'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getProfile, signOut, type Profile } from '@/lib/auth'
import { generateCouponPDF, downloadPDF } from '@/lib/generateCoupon'
import { supabase } from '@/lib/supabase'

const MENU = ['Mes commandes', 'Paramètres']

function fmt(n: number) { return n.toLocaleString('fr-FR') }
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const STATUS_LABEL: Record<string, string> = {
  pending:         'En attente de paiement',
  confirmed:       'Paiement confirmé',
  paid:            'Payée',
  in_transit:      'En transit vers Lomé',
  in_customs:      'En douane',
  customs_cleared: 'Dédouanée',
  ready:           'Prête à retirer',
  delivered:       'Livrée',
  cancelled:       'Annulée',
  refunded:        'Remboursée',
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  pending:         { bg: '#FFF7ED', color: '#C05E08' },
  confirmed:       { bg: '#EEF2FF', color: '#4338CA' },
  paid:            { bg: '#F0FDF4', color: '#166534' },
  in_transit:      { bg: '#EFF6FF', color: '#1D4ED8' },
  in_customs:      { bg: '#FFFBEB', color: '#92400E' },
  customs_cleared: { bg: '#F5F3FF', color: '#5B21B6' },
  ready:           { bg: '#ECFDF5', color: '#065F46' },
  delivered:       { bg: '#F0FDF4', color: '#166534' },
  cancelled:       { bg: '#FEF2F2', color: '#991B1B' },
  refunded:        { bg: '#F9FAFB', color: '#6B7280' },
}

// Étapes du suivi dans l'ordre chronologique
const TRACKING_STEPS = [
  { key: 'pending',         label: 'Commande reçue',      icon: '📋' },
  { key: 'confirmed',       label: 'Paiement confirmé',   icon: '✅' },
  { key: 'in_transit',      label: 'En transit',           icon: '🚢' },
  { key: 'in_customs',      label: 'En douane',            icon: '🔍' },
  { key: 'customs_cleared', label: 'Dédouanée',            icon: '📦' },
  { key: 'ready',           label: 'Prête à retirer',      icon: '🏪' },
  { key: 'delivered',       label: 'Livrée',               icon: '🎉' },
]

const STEP_ORDER = TRACKING_STEPS.map(s => s.key)

function getStepIndex(status: string) {
  const idx = STEP_ORDER.indexOf(status)
  return idx >= 0 ? idx : (status === 'paid' ? 1 : -1)
}

export default function ComptePage() {
  const router = useRouter()
  const [tab, setTab] = useState('Mes commandes')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState<string | null>(null)

  useEffect(() => {
    getUser().then(async user => {
      if (!user) { router.push('/connexion?redirect=/compte'); return }
      setEmail(user.email ?? '')
      const p = await getProfile(user.id)
      setProfile(p)
      const phone = p?.phone ?? ''
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from('orders') as any)
        .select('*, order_items(id, quantity, color, unit_price_cfa, products(name, images, customs_fee_cfa)), cycles(name)')
        .or(`customer_email.eq.${user.email},customer_phone.eq.${phone}`)
        .order('created_at', { ascending: false })
      setOrders(data ?? [])
      setLoadingOrders(false)
      setAuthLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleDownload = async (order: any) => {
    setPdfLoading(order.id)
    const items = (order.order_items ?? []).map((i: any) => ({
      name: i.products?.name ?? 'Produit',
      qty: i.quantity,
      unitPrice: i.unit_price_cfa ?? 0,
      color: i.color ?? '',
      imageUrl: i.products?.images?.[0] ?? undefined,
    }))
    const calculatedCustoms = (order.order_items ?? []).reduce((s: number, i: any) => s + (i.products?.customs_fee_cfa ?? 0) * i.quantity, 0)
    const bytes = await generateCouponPDF({
      reference: order.reference ?? order.id,
      customerName: order.customer_name ?? '',
      customerPhone: order.customer_phone ?? '',
      items,
      totalMarchandises: order.total_cfa ?? 0,
      fraisDouane: calculatedCustoms,
      cycle: order.cycles?.name ?? '',
      date: new Date(order.created_at).toLocaleDateString('fr-FR'),
    })
    downloadPDF(bytes, `recu-${order.reference ?? order.id}.pdf`)
    setPdfLoading(null)
  }

  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text-3)' }}>
        Chargement…
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>

        {/* Sidebar */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--orange-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--orange)', margin: '0 auto 12px' }}>
              {profile ? initials(profile.name) : '?'}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{profile?.name ?? 'Client'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{profile?.phone || email}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)', background: 'var(--bg)', borderRadius: 6, padding: '4px 8px' }}>
              {orders.length} commande{orders.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {MENU.map((item, i) => (
              <button key={item} onClick={() => setTab(item)} style={{ width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: tab === item ? 600 : 400, color: tab === item ? 'var(--text)' : 'var(--text-2)', cursor: 'pointer', textAlign: 'left', background: tab === item ? 'var(--orange-light)' : 'none', borderLeft: tab === item ? '3px solid var(--orange)' : '3px solid transparent', borderTop: i > 0 ? '1px solid var(--border)' : 'none', borderRight: 'none', borderBottom: 'none' }}>
                {item}
              </button>
            ))}
            <button onClick={handleLogout} style={{ width: '100%', padding: '10px 14px', fontSize: 13, color: '#C62828', cursor: 'pointer', textAlign: 'left', background: 'none', borderLeft: '3px solid transparent', borderTop: '1px solid var(--border)', borderRight: 'none', borderBottom: 'none' }}>
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div>
          {tab === 'Mes commandes' && (
            <>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Mes commandes</h2>
              {loadingOrders ? (
                <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Chargement…</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Aucune commande</div>
                  <Link href="/catalogue" className="btn-primary" style={{ fontSize: 13 }}>Parcourir le catalogue</Link>
                </div>
              ) : (
                orders.map((order: any) => {
                  const sc = STATUS_COLOR[order.status] ?? { bg: '#FFF7ED', color: '#C05E08' }
                  const stepIdx = getStepIndex(order.status)
                  const isOpen = expandedOrder === order.id
                  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
                  const totalCustoms = (order.order_items ?? []).reduce((s: number, i: any) => s + (i.products?.customs_fee_cfa ?? 0) * i.quantity, 0)
                  return (
                    <div key={order.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 14, overflow: 'hidden' }}>

                      {/* En-tête commande */}
                      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{order.reference ?? '—'}</span>
                            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>
                              {STATUS_LABEL[order.status] ?? order.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                            {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            {order.cycles?.name && ` · Cycle : ${order.cycles.name}`}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)', marginTop: 4 }}>{fmt(order.total_cfa ?? 0)} FCFA</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <button
                            onClick={() => handleDownload(order)}
                            disabled={pdfLoading === order.id}
                            style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: pdfLoading === order.id ? 'wait' : 'pointer', opacity: pdfLoading === order.id ? .7 : 1, whiteSpace: 'nowrap' }}>
                            {pdfLoading === order.id ? '…' : '⬇ Reçu PDF'}
                          </button>
                          <button
                            onClick={() => setExpandedOrder(isOpen ? null : order.id)}
                            style={{ background: 'none', border: '1px solid var(--border-2)', color: 'var(--text-2)', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {isOpen ? 'Masquer ▲' : 'Détails ▼'}
                          </button>
                        </div>
                      </div>

                      {/* Suivi visuel */}
                      {!isCancelled && (
                        <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--bg)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10, paddingTop: 14 }}>Suivi</div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
                            {TRACKING_STEPS.map((step, idx) => {
                              const done = idx <= stepIdx
                              const current = idx === stepIdx
                              return (
                                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto', minWidth: 72 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
                                    {idx > 0 && (
                                      <div style={{ flex: 1, height: 2, background: done ? 'var(--orange)' : 'var(--border-2)', marginRight: -1 }} />
                                    )}
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: current ? 'var(--orange)' : done ? 'var(--orange-light)' : 'var(--bg)', border: `2px solid ${done ? 'var(--orange)' : 'var(--border-2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, zIndex: 1, position: 'relative' }}>
                                      {done ? (current ? step.icon : '✓') : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border-2)', display: 'block' }} />}
                                    </div>
                                    {idx < TRACKING_STEPS.length - 1 && (
                                      <div style={{ flex: 1, height: 2, background: idx < stepIdx ? 'var(--orange)' : 'var(--border-2)', marginLeft: -1 }} />
                                    )}
                                  </div>
                                  <div style={{ fontSize: 9, color: current ? 'var(--orange)' : done ? 'var(--text-2)' : 'var(--text-3)', textAlign: 'center', marginTop: 5, fontWeight: current ? 700 : 400, lineHeight: 1.3, maxWidth: 68 }}>
                                    {step.label}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {totalCustoms > 0 && (
                            <div style={{ marginTop: 10, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#92400E' }}>
                              Frais de douane estimés : <strong>{fmt(totalCustoms)} FCFA</strong> — à régler à la livraison
                            </div>
                          )}
                        </div>
                      )}

                      {isCancelled && (
                        <div style={{ padding: '10px 20px 14px', borderTop: '1px solid var(--bg)', fontSize: 12, color: '#991B1B', background: '#FEF2F2' }}>
                          Cette commande a été {order.status === 'refunded' ? 'remboursée' : 'annulée'}. Contactez-nous sur WhatsApp pour toute question.
                        </div>
                      )}

                      {/* Détail articles */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 20px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.04em' }}>Articles commandés</div>
                          {(order.order_items ?? []).length === 0 ? (
                            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Aucun détail disponible</div>
                          ) : (
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                  <th style={{ textAlign: 'left', padding: '4px 6px', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Article</th>
                                  <th style={{ textAlign: 'center', padding: '4px 6px', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Qté</th>
                                  <th style={{ textAlign: 'right', padding: '4px 6px', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>P.U.</th>
                                  <th style={{ textAlign: 'right', padding: '4px 6px', fontSize: 11, color: 'var(--text-3)', fontWeight: 500 }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.order_items.map((item: any) => (
                                  <tr key={item.id} style={{ borderBottom: '1px solid var(--bg)' }}>
                                    <td style={{ padding: '8px 6px' }}>
                                      <div style={{ fontWeight: 500 }}>{item.products?.name ?? 'Produit'}</div>
                                      {item.color && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.color}</div>}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '8px 6px' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', padding: '8px 6px', whiteSpace: 'nowrap' }}>{fmt(item.unit_price_cfa ?? 0)}</td>
                                    <td style={{ textAlign: 'right', padding: '8px 6px', fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--orange)' }}>{fmt((item.unit_price_cfa ?? 0) * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3} style={{ textAlign: 'right', padding: '10px 6px 0', fontWeight: 700, fontSize: 13 }}>Total marchandises</td>
                                  <td style={{ textAlign: 'right', padding: '10px 6px 0', fontWeight: 700, color: 'var(--orange)', whiteSpace: 'nowrap' }}>{fmt(order.total_cfa ?? 0)} FCFA</td>
                                </tr>
                                {totalCustoms > 0 && (
                                  <tr>
                                    <td colSpan={3} style={{ textAlign: 'right', padding: '4px 6px', fontSize: 12, color: 'var(--text-2)' }}>Frais de douane estimés</td>
                                    <td style={{ textAlign: 'right', padding: '4px 6px', fontSize: 12, color: '#92400E', whiteSpace: 'nowrap' }}>{fmt(totalCustoms)} FCFA</td>
                                  </tr>
                                )}
                              </tfoot>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </>
          )}

          {tab === 'Paramètres' && profile && (
            <div>
              <h2 className="section-title" style={{ marginBottom: 16 }}>Paramètres</h2>
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, maxWidth: 400 }}>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Nom complet</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{profile.name}</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Téléphone WhatsApp</div>
                  <div style={{ fontSize: 14 }}>{profile.phone || 'Non renseigné'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>E-mail</div>
                  <div style={{ fontSize: 14 }}>{email}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
