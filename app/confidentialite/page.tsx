export default function Confidentialite() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Politique de confidentialité</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Dernière mise à jour : octobre 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>1. Données collectées</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          SAFEL GROUP collecte les données personnelles suivantes lorsque vous passez une commande ou créez un compte :
        </p>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20, marginTop: 8 }}>
          <li>Nom et prénom</li>
          <li>Numéro de téléphone (WhatsApp)</li>
          <li>Adresse e-mail (optionnelle)</li>
          <li>Historique de commandes</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>2. Finalité de la collecte</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Ces données sont collectées exclusivement pour :
        </p>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20, marginTop: 8 }}>
          <li>Traiter et suivre vos commandes</li>
          <li>Vous contacter pour vous informer de l'avancement de votre commande</li>
          <li>Vous envoyer votre bon de commande</li>
          <li>Gérer votre compte client</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>3. Conservation des données</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Vos données sont conservées pendant la durée nécessaire au traitement de votre commande et pour une période de 2 ans après votre dernière commande, conformément aux obligations légales en vigueur au Togo.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>4. Partage des données</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          SAFEL GROUP ne vend ni ne cède vos données personnelles à des tiers. Vos données sont stockées de manière sécurisée via Supabase (infrastructure cloud). Elles ne sont accessibles qu'aux membres de l'équipe SAFEL GROUP dans le cadre strict du traitement de vos commandes.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>5. Vos droits</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via WhatsApp au <strong>+228 70 62 67 96</strong>. Nous traiterons votre demande dans un délai de 7 jours ouvrables.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>6. Cookies</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Ce site utilise des cookies techniques nécessaires à son fonctionnement (session admin, panier). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>7. Contact</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Pour toute question concernant vos données personnelles : <strong>+228 70 62 67 96</strong> (WhatsApp).
        </p>
      </section>
    </div>
  )
}
