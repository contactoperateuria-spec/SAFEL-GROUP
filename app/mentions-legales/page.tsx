export default function MentionsLegales() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Mentions légales</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Dernière mise à jour : octobre 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Vendeur</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2 }}>
          <strong>Nom commercial :</strong> SAFEL GROUP<br />
          <strong>Adresse :</strong> Lomé, Togo<br />
          <strong>Contact :</strong> WhatsApp +228 70 62 67 96<br />
          <strong>Directeur de la publication :</strong> SAFEL GROUP
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Hébergement et infrastructure</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          <strong>Hébergeur :</strong> Vercel Inc., 340 Pine Street Suite 700, San Francisco, CA 94104, États-Unis.<br />
          <strong>Base de données :</strong> Supabase (Supabase Inc., San Francisco, États-Unis).
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Conception du site</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Site conçu et développé par <strong>A.K. Phylippes / L'Opérateur</strong>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Propriété intellectuelle</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Le logo, les textes et le design du site appartiennent à SAFEL GROUP. Les photos de produits sont fournies par les fournisseurs et peuvent différer légèrement du produit reçu. Toute reproduction non autorisée est interdite.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Responsabilité</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          SAFEL GROUP s'efforce de maintenir des informations exactes et à jour. Cependant, les délais et disponibilités peuvent varier. SAFEL GROUP ne saurait être tenu responsable d'erreurs ou omissions sur ce site.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Droit applicable</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Le présent site est soumis au droit togolais. Tout litige relatif à son utilisation sera soumis aux tribunaux compétents de Lomé, Togo.
        </p>
      </section>
    </div>
  )
}
