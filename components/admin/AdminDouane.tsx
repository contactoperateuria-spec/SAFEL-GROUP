'use client'
import { useState } from 'react'

type Step = 1 | 2 | 3

const ARTICLES = [
  { id: 'art1', emoji: '🎧', bg: '#E8F0FE', name: 'Écouteurs Bluetooth TWS', cat: 'Électronique · 4 commandes concernées', prix: 18000 },
  { id: 'art2', emoji: '🧴', bg: '#FFF0E6', name: 'Sérum Vitamine C 30ml', cat: 'Beauté · 3 commandes concernées', prix: 4500 },
  { id: 'art3', emoji: '👗', bg: '#FEF3E8', name: 'Robe florale S-XL', cat: 'Mode Femme · 5 commandes concernées', prix: 14500 },
]

const RECUS = [
  { ref: 'SG-2025-0041', client: 'Kofi Mensah', tel: '+228 92 00 00 00', articles: [{ id: 'art1', qty: 1 }, { id: 'art2', qty: 2 }], marchTotal: 27000 },
  { ref: 'SG-2025-0044', client: 'Adjobi Kossi', tel: '+228 90 00 00 00', articles: [{ id: 'art1', qty: 1 }, { id: 'art3', qty: 2 }], marchTotal: 47000 },
  { ref: 'SG-2025-0045', client: 'Ami Dossou', tel: '+228 91 00 00 00', articles: [{ id: 'art3', qty: 3 }], marchTotal: 43500 },
  { ref: 'SG-2025-0038', client: 'Ama Sodzi', tel: '+228 94 00 00 00', articles: [{ id: 'art2', qty: 2 }, { id: 'art3', qty: 1 }], marchTotal: 23500 },
  { ref: 'SG-2025-0040', client: 'Eli Amégah', tel: '+228 95 00 00 00', articles: [{ id: 'art1', qty: 2 }], marchTotal: 36000 },
]

function fmt(n: number) { return n.toLocaleString('fr-FR') }

export default function AdminDouane() {
  const [step, setStep] = useState<Step>(1)
  const [selectedBl, setSelectedBl] = useState<string | null>(null)
  const [frais, setFrais] = useState<Record<string, number>>({})
  const [sent, setSent] = useState(false)

  const calcDouane = (recuArticles: { id: string; qty: number }[]) =>
    recuArticles.reduce((s, a) => s + (frais[a.id] ?? 0) * a.qty, 0)

  const concernedRecus = RECUS.filter(r => calcDouane(r.articles) > 0)
  const totalDouane = concernedRecus.reduce((s, r) => s + calcDouane(r.articles), 0)

  const StepDot = ({ n }: { n: number }) => {
    const done = n < step
    const current = n === step
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, opacity: n > step ? .4 : 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#4ADE80' : current ? 'var(--orange)' : 'rgba(255,255,255,.15)', color: done || current ? '#fff' : 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {done ? '✓' : n}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: current ? '#fff' : 'rgba(255,255,255,.6)' }}>
          {['Sélectionner le groupage', 'Saisir les frais par article', 'Calcul & Notification'][n - 1]}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Frais de douane — Groupage terminé</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginBottom: 20 }}>Renseignez le coût de douane par article, le système calcule automatiquement le montant dû pour chaque reçu.</div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
        <StepDot n={1} />
        <div style={{ flex: 1, height: 2, background: step > 1 ? '#4ADE80' : 'rgba(255,255,255,.1)', margin: '0 8px' }} />
        <StepDot n={2} />
        <div style={{ flex: 1, height: 2, background: step > 2 ? '#4ADE80' : 'rgba(255,255,255,.1)', margin: '0 8px' }} />
        <StepDot n={3} />
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { bl: 'BL-2025-008', cycle: 'Septembre 2025', status: 'ARRIVÉ À LOMÉ', statusStyle: { background: 'rgba(74,222,128,.15)', color: '#4ADE80' } },
            { bl: 'BL-2025-007', cycle: 'Août 2025', status: 'DOUANE EN COURS', statusStyle: { background: 'rgba(147,197,253,.15)', color: '#93C5FD' } },
          ].map(g => (
            <div key={g.bl} onClick={() => { setSelectedBl(g.bl); setTimeout(() => setStep(2), 300) }} style={{ background: selectedBl === g.bl ? 'rgba(232,114,12,.08)' : 'rgba(255,255,255,.05)', border: `1.5px solid ${selectedBl === g.bl ? 'var(--orange)' : 'rgba(255,255,255,.1)'}`, borderRadius: 8, padding: 14, cursor: 'pointer', transition: 'all .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Bordereau {g.bl}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Cycle {g.cycle}</div>
                </div>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 4, fontWeight: 600, ...g.statusStyle }}>{g.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{selectedBl} · Groupage sélectionné</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Renseignez le montant de douane pour chaque article</div>
            </div>
            <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>← Changer</button>
          </div>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 120px 120px', gap: 0, padding: '8px 14px', background: 'rgba(255,255,255,.04)', fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span></span><span>Article</span><span style={{ textAlign: 'right' }}>Prix unit.</span><span style={{ textAlign: 'right' }}>Douane/pièce (FCFA)</span>
            </div>
            {ARTICLES.map(a => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr 120px 120px', gap: 0, padding: '10px 14px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{a.emoji}</div>
                <div style={{ paddingLeft: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{a.cat}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{fmt(a.prix)} FCFA</div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <input type="number" placeholder="0" value={frais[a.id] ?? ''} onChange={e => setFrais(prev => ({ ...prev, [a.id]: parseInt(e.target.value) || 0 }))} style={{ width: 90, background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.15)', color: '#fff', borderRadius: 4, fontSize: 13, fontWeight: 600, padding: '5px 8px', outline: 'none', textAlign: 'right' }} />
                </div>
              </div>
            ))}
          </div>

          {Object.values(frais).some(v => v > 0) && (
            <div style={{ background: 'rgba(232,114,12,.08)', border: '1px solid rgba(232,114,12,.25)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.8)', marginBottom: 8 }}>Aperçu · <span style={{ color: 'var(--orange)' }}>{concernedRecus.length} reçu{concernedRecus.length > 1 ? 's' : ''}</span> concernés</div>
              {concernedRecus.map(r => {
                const d = calcDouane(r.articles)
                return (
                  <div key={r.ref} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <span style={{ color: 'rgba(255,255,255,.6)' }}>{r.ref} · {r.client}</span>
                    <span style={{ color: 'var(--orange)', fontWeight: 700 }}>+{fmt(d)} FCFA douane</span>
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, paddingTop: 8 }}>
                <span style={{ color: 'rgba(255,255,255,.45)' }}>Total douane à collecter</span>
                <span style={{ color: 'var(--orange)', fontWeight: 700 }}>{fmt(totalDouane)} FCFA</span>
              </div>
            </div>
          )}

          <button onClick={() => setStep(3)} style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Calculer pour chaque reçu →</button>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Récapitulatif par reçu</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Vérifiez les montants avant d&apos;envoyer les notifications</div>
            </div>
            <button onClick={() => setStep(2)} style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>← Modifier</button>
          </div>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr', gap: 0, padding: '8px 14px', background: 'rgba(255,255,255,.04)', fontSize: 10, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <span>Reçu</span><span>Client</span><span style={{ textAlign: 'right' }}>Marchandises</span><span style={{ textAlign: 'right' }}>Douane calculée</span>
            </div>
            {concernedRecus.map(r => {
              const d = calcDouane(r.articles)
              return (
                <div key={r.ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr 1fr', gap: 0, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,.05)', fontSize: 12, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{r.ref}</span>
                  <span><div>{r.client}</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>{r.tel}</div></span>
                  <span style={{ textAlign: 'right', color: 'rgba(255,255,255,.55)' }}>{fmt(r.marchTotal)} FCFA</span>
                  <span style={{ textAlign: 'right' }}><div style={{ color: 'var(--orange)', fontWeight: 700 }}>+{fmt(d)} FCFA</div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)' }}>= {fmt(r.marchTotal + d)} FCFA</div></span>
                </div>
              )
            })}
          </div>

          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 'var(--radius)', padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: 'rgba(255,255,255,.45)' }}>Reçus concernés</span>
              <span style={{ fontWeight: 600 }}>{concernedRecus.length} reçu{concernedRecus.length > 1 ? 's' : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.1)' }}>
              <span style={{ color: 'rgba(255,255,255,.7)' }}>Total douane à collecter</span>
              <span style={{ color: 'var(--orange)' }}>{fmt(totalDouane)} FCFA</span>
            </div>
          </div>

          {sent ? (
            <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.25)', borderRadius: 'var(--radius)', padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>✅</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4ADE80', marginBottom: 4 }}>Notifications envoyées avec succès</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)' }}>{concernedRecus.length} client{concernedRecus.length > 1 ? 's ont reçu' : ' a reçu'} une notification avec le montant de douane et le total final.</div>
            </div>
          ) : (
            <button onClick={() => setSent(true)} style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, padding: 11, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
              </svg>
              Confirmer & Notifier les {concernedRecus.length} clients
            </button>
          )}
        </div>
      )}
    </div>
  )
}
