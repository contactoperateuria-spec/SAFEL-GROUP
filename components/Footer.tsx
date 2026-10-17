import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#1A1A1A', color: 'rgba(255,255,255,.75)', padding: '48px 0 24px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: 'var(--orange)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>SG</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>SAFEL GROUP</div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>
              Achetez en Chine sans vous déplacer. Commandes groupées, livraison à Lomé, processus clair et sécurisé.
            </p>
            <a href="https://wa.me/22870626796" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
              <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              WhatsApp +228 70 62 67 96
            </a>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Navigation</div>
            <ul className="footer-links">
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/catalogue">Catalogue</Link></li>
              <li><Link href="/suivi">Suivre un colis</Link></li>
              <li><Link href="/compte">Mon compte</Link></li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Informations</div>
            <ul className="footer-links">
              <li><Link href="/politique-precommande">Règles de la précommande</Link></li>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/confidentialite">Confidentialité</Link></li>
              <li><Link href="/suivi#faq">FAQ</Link></li>
              <li><a href="https://wa.me/22870626796" target="_blank" rel="noopener noreferrer">Contact</a></li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Paiements acceptés</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,.7)' }}>📱 Moov Money</div>
              <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,.7)' }}>📱 Mixx by Yas</div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'rgba(255,255,255,.35)' }}>
          <span>© 2025 SAFEL GROUP · Lomé, Togo · Tous droits réservés</span>
          <a href="https://contactoperateuria-spec.github.io/contactoperateur/" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>Conception : A.K.PHYLIPPES</a>
        </div>
      </div>
    </footer>
  )
}
