export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px',
      fontFamily: 'var(--font-sans, system-ui, sans-serif)',
    }}>
      <div style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🔧</div>

        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: 12,
        }}>
          En cours de finalisation
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--text-2)',
          lineHeight: 1.65,
          marginBottom: 28,
        }}>
          L&apos;application SAFEL GROUP est actuellement en cours de finalisation.
          Elle sera disponible très prochainement.
        </p>

        <div style={{
          background: 'var(--bg)',
          borderRadius: 8,
          padding: '14px 18px',
          border: '1px solid var(--border)',
          fontSize: 13,
          color: 'var(--text-3)',
        }}>
          Pour toute question, contactez-nous via WhatsApp.
        </div>
      </div>
    </div>
  )
}
