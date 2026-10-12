export default function PolitiquePrecommande() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Politique de précommande</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Dernière mise à jour : octobre 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>1. Qu'est-ce qu'une précommande ?</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          SAFEL GROUP organise des cycles d'achat groupé depuis la Chine vers Lomé (Togo). Chaque cycle est une période pendant laquelle vous pouvez passer une commande. Les produits sont ensuite achetés, expédiés et livrés ensemble une fois le cycle fermé.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>2. Processus de commande</h2>
        <ol style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20 }}>
          <li>Vous sélectionnez vos produits et passez commande pendant un cycle ouvert.</li>
          <li>Vous recevez un bon de commande (coupon PDF) par téléchargement.</li>
          <li>Vous effectuez le paiement par Mobile Money (Flooz / T-Money) ou en espèces.</li>
          <li>SAFEL GROUP confirme votre commande après réception du paiement.</li>
          <li>Les marchandises sont expédiées depuis la Chine à la fermeture du cycle.</li>
          <li>Vous êtes notifié à chaque étape : expédition, arrivée en douane, livraison.</li>
        </ol>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>3. Délais</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Les délais de livraison sont estimés à 4 à 8 semaines après la fermeture du cycle, selon les conditions d'expédition et les délais douaniers. SAFEL GROUP s'engage à vous communiquer régulièrement l'avancement de votre commande via WhatsApp.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>4. Paiement</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Le paiement intégral est requis au moment de la confirmation de commande. Les modes de paiement acceptés sont : Flooz, T-Money, et espèces en main propre. Aucune commande n'est traitée sans paiement confirmé.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>5. Frais de douane</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Des frais de douane peuvent s'appliquer à votre commande lors du passage en douane au Togo. Ces frais sont variables et vous seront communiqués avant la livraison finale. Ils sont à régler par le client avant la remise des marchandises.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>6. Annulation et remboursement</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Une commande peut être annulée uniquement avant la fermeture du cycle. Après fermeture, les achats sont engagés auprès des fournisseurs chinois et aucun remboursement ne peut être accordé, sauf en cas de manquant ou de marchandise non conforme à la commande.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>7. Réclamations</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Toute réclamation concernant un produit manquant ou non conforme doit être signalée à SAFEL GROUP dans les 48 heures suivant la réception, via WhatsApp au <strong>+228 70 62 67 96</strong>. Au-delà de ce délai, aucune réclamation ne pourra être prise en compte.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>8. Contact</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Pour toute question relative à votre commande, contactez-nous sur WhatsApp : <strong>+228 70 62 67 96</strong>.
        </p>
      </section>
    </div>
  )
}
