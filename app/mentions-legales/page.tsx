export default function MentionsLegales() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Mentions légales</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Dernière mise à jour : octobre 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Éditeur du site</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2 }}>
          <strong>Nom commercial :</strong> SAFEL GROUP<br />
          <strong>Activité :</strong> Commerce de produits importés depuis la Chine (achat groupé)<br />
          <strong>Pays d'exercice :</strong> Togo<br />
          <strong>Contact :</strong> +228 70 62 67 96 (WhatsApp)<br />
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Hébergement</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Ce site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 700, San Francisco, CA 94104, États-Unis.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Propriété intellectuelle</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          L'ensemble des contenus présents sur ce site (textes, images, logos, structure) est la propriété exclusive de SAFEL GROUP. Toute reproduction, distribution ou utilisation sans autorisation préalable est interdite.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Responsabilité</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          SAFEL GROUP s'efforce de fournir des informations exactes et à jour sur ce site. Cependant, des erreurs ou omissions peuvent survenir. SAFEL GROUP ne saurait être tenu responsable de l'utilisation faite des informations présentes sur ce site.
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
