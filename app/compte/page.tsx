'use client'
import { useState } from 'react'
import Link from 'next/link'

const ORDERS = [
  {
    ref: 'SG-2025-0047',
    date: '06/10/2025',
    items: [
      { emoji: '🧴', bg: '#FFF0E6', qty: 2 },
      { emoji: '🎧', bg: '#E8F0FE', qty: 1 },
      { emoji: '👗', bg: '#FEF3E8', qty: 2 },
    ],
    total: 56000,
    status: 'pending',
    statusLabel: 'En attente',
    statusStyle: { background: '#FFF7ED', color: '#C05E08' },
  },
  {
    ref: 'SG-2025-0041',
    date: '12/09/2025',
    items: [{ emoji: '🎧', bg: '#E8F0FE', qty: 1 }],
    total: 18000,
    status: 'transit',
    statusLabel: 'En transit',
    statusStyle: { background: '#EEF2FF', color: '#4338CA' },
    bordereau: 'BL-2025-008',
  },
]

const MENU = ['Mes commandes', 'Mes favoris', 'Mes adresses', 'Mes reçus', 'Paramètres']

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function ComptePage() {
  const [tab, setTab] = useState('Mes commandes')

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--orange-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'var(--orange)', margin: '0 auto 12px' }}>AK</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Adjobi Kossi</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>+228 90 00 00 00</div>
          </div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {MENU.map((item, i) => (
              <button key={item} onClick={() => setTab(item)} style={{ width: '100%', padding: '10px 14px', fontSize: 13, fontWeight: tab === item ? 600 : 400, color: tab === item ? 'var(--text)' : 'var(--text-2)', cursor: 'pointer', textAlign: 'left', background: tab === item ? 'var(--orange-light)' : 'none', borderLeft: tab === item ? '3px solid var(--orange)' : '3px solid transparent', borderTop: i > 0 ? '1px solid var(--border)' : 'none', borderRight: 'none', borderBottom: 'none' }}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        <div>
          <h2 className="section-title" style={{ marginBottom: 16 }}>{tab}</h2>

          {tab === 'Mes commandes' && (
            <>
              {ORDERS.map(order => (
                <div key={order.ref} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 2 }}>
                        {order.ref} · {order.date}
                        {order.bordereau && ` · Bordereau ${order.bordereau}`}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{ width: 40, height: 40, borderRadius: 7, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative', background: item.bg }}>
                            {item.emoji}
                            <span style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--orange)', color: '#fff', fontSize: 9, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid var(--white)' }}>×{item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600, marginTop: 8 }}>{fmt(order.total)} FCFA</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, ...order.statusStyle }}>{order.statusLabel}</span>
                      <Link href="/coupon" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Télécharger le reçu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Solde douane */}
              <div style={{ background: 'var(--orange-light)', border: '1px solid var(--orange)', borderRadius: 'var(--radius)', padding: 16, marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--orange-dark)', marginBottom: 6 }}>Solde douane — SG-2025-0038</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
                  Frais de douane fixés : <strong>3 200 FCFA</strong> · Total final : <strong>21 200 FCFA</strong>
                </div>
                <a href="https://wa.me/22870626796?text=Bonjour%2C%20je%20souhaite%20r%C3%A9gler%20les%20frais%20de%20douane%20pour%20la%20commande%20SG-2025-0038%20(3%20200%20FCFA)" target="_blank" rel="noopener noreferrer" className="whatsapp-btn" style={{ fontSize: 12 }}>
                  <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                  </svg>
                  Contacter sur WhatsApp — Ref. SG-2025-0038 · Douane 3 200 FCFA
                </a>
              </div>
            </>
          )}

          {tab !== 'Mes commandes' && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚧</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Section en cours de développement</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
