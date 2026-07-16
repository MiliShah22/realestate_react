/**
 * Shared loading / error / empty UI states used across all pages.
 * Keeps every page from duplicating spinner + error message JSX.
 */
export function Spinner({ size = 32, text = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: 12 }}>
      <i className="ti ti-loader-2"
        style={{ fontSize: size, color: 'var(--navy)', animation: 'spin 0.9s linear infinite' }}>
      </i>
      {text && <p style={{ fontSize: 13, color: 'var(--text3)' }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ApiError({ error, onRetry }) {
  const isNetwork = !navigator.onLine || error?.message?.toLowerCase().includes('network');
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text3)' }}>
      <i className="ti ti-wifi-off" style={{ fontSize: 40, display: 'block', marginBottom: 12, opacity: 0.4 }}></i>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>
        {isNetwork ? 'No internet connection' : 'Something went wrong'}
      </p>
      <p style={{ fontSize: 13, marginBottom: 16 }}>
        {error?.message || 'Unable to load data. Please try again.'}
      </p>
      {onRetry && (
        <button className="btn-navy" style={{ padding: '9px 20px', borderRadius: 8 }} onClick={onRetry}>
          <i className="ti ti-refresh" style={{ fontSize: 14, verticalAlign: -2, marginRight: 5 }}></i>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = 'ti-inbox', title = 'Nothing here yet', description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text3)' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 44, display: 'block', marginBottom: 14, opacity: 0.3 }}></i>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>{title}</p>
      {description && <p style={{ fontSize: 13, marginBottom: 18, maxWidth: 320, margin: '0 auto 18px' }}>{description}</p>}
      {action}
    </div>
  );
}
