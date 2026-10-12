export default function PolitiquePrecommande() {
  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 64, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Règles de la précommande</h1>
      <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 32 }}>Dernière mise à jour : octobre 2025</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>1. Comment ça marche</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Nous achetons en Chine pour vous, par commandes groupées. Vous choisissez vos articles pendant la période d'ouverture du cycle (en général un mois), puis nous passons la commande groupée à la clôture.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>2. Paiement en deux temps</h2>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20 }}>
          <li><strong>À la commande :</strong> vous payez la totalité du prix des marchandises, par Moov Money ou Mixx by Yas. Votre commande est confirmée dès que nous validons votre paiement.</li>
          <li><strong>Plus tard :</strong> les frais de douane sont fixés à l'arrivée des marchandises à Lomé. Vous réglez alors ce solde avant le retrait.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>3. Délais</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Les délais affichés sont indicatifs. Ils dépendent de l'expédition et de la douane, et peuvent varier. Nous vous informons à chaque étape : achat, expédition, arrivée à Lomé.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>4. Livraison et retrait</h2>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20 }}>
          <li>Livraison à Lomé et environs, ou retrait sur place à Lomé, Togo.</li>
          <li>Hors de cette zone : retrait au lieu du conteneur, avec préavis.</li>
          <li>Vous êtes prévenu dès que votre colis est prêt.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>5. Suivi</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Chaque commande reçoit un numéro (SG-AAAA-XXXXXX) et, une fois expédiée, un numéro de bordereau consultable sur la page <strong>« Suivre mon colis »</strong>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>6. Annulation, transfert et crédit</h2>
        <ul style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 2, paddingLeft: 20 }}>
          <li>Aucun remboursement après paiement car la commande est transmise au fournisseur.</li>
          <li>Si SAFEL GROUP annule un produit (indisponibilité fournisseur, douane trop élevée) : remboursement à 100 %, frais de transfert inclus, sous 7 jours ouvrables.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>7. Produit non conforme ou endommagé</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Signalez-le sous <strong>48 h</strong> après la réception, avec photos, par WhatsApp au <strong>+228 70 62 67 96</strong>. Nous étudions chaque cas avec le fournisseur et vous proposons une solution (remplacement ou remboursement) selon ce qui est possible.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>8. Couleurs et tailles</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Les photos sont indicatives : de légères différences de couleur ou de finition sont possibles. Vérifiez la taille et la variante avant de valider votre commande.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>9. Retrait tardif</h2>
        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>
          Un colis non retiré sous <strong>30 jours</strong> après notification peut entraîner des frais de garde. Contactez-nous pour tout arrangement : <strong>+228 70 62 67 96</strong>.
        </p>
      </section>
    </div>
  )
}
