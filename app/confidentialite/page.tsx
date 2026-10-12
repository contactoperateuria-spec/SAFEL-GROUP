export default function Confidentialite() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Politique de confidentialité</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Dernière mise à jour : octobre 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>1. Données collectées</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 8 }}>
          Nous collectons : nom, téléphone, e-mail, historique de commandes et captures de preuve de paiement. Nous ne conservons aucun code secret ni mot de passe de portefeuille mobile.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>2. Utilisation</h2>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20 }}>
          <li>Traiter vos commandes</li>
          <li>Vous prévenir à chaque étape : paiement validé, arrivée à Lomé, douane à régler, colis prêt</li>
          <li>Gérer les remboursements et répondre à vos demandes</li>
          <li>Pas de publicité sans votre accord</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>3. Partage</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Uniquement avec les services nécessaires : Supabase (comptes et base de données), l'hébergeur Vercel, les transporteurs et livreurs (nom, téléphone, adresse de livraison). Nous ne vendons pas vos données.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>4. Conservation</h2>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20 }}>
          <li><strong>Compte :</strong> tant qu'il est actif.</li>
          <li><strong>Commandes et reçus :</strong> 1 an.</li>
          <li><strong>Preuves de paiement :</strong> 12 mois après la livraison, puis supprimées.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>5. Vos droits</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Vous disposez d'un droit d'accès, de correction ou de suppression de vos données. Adressez votre demande par WhatsApp au <strong>+228 70 62 67 96</strong>. Réponse sous 30 jours.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>6. Sécurité</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Connexion chiffrée (HTTPS), accès restreint à l'équipe SAFEL GROUP, mots de passe chiffrés via Supabase Auth.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>7. Cookies</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Uniquement les cookies nécessaires à la connexion et au panier. Aucun cookie publicitaire ou de tracking tiers.
        </p>
      </section>
    </div>
  )
}
