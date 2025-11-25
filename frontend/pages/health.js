import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function HealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${BACKEND_URL}/healthz`);
        if (!res.ok) {
          throw new Error('Failed to load health data');
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError('Unable to load health information.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <header style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <div
          className="container"
          style={{
            paddingTop: '0.75rem',
            paddingBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>TinyLink</div>
          <nav style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem' }}>
            <a href="/" style={{ color: '#4b5563' }}>
              Dashboard
            </a>
            <span style={{ color: '#d1d5db' }}>|</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>Health</span>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Healthcheck</h1>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          System details and uptime details reported by the backend `/healthz` endpoint.
        </p>

        {loading && <div className="card text-muted">Loading health data...</div>}
        {error && !loading && <div className="card text-error">{error}</div>}

        {!loading && !error && data && (
          <section className="card" style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                Status
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{data.ok ? 'OK' : 'Degraded'}</div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Backend URL
                </div>
                <div style={{ fontSize: '0.85rem' }}>{BACKEND_URL}</div>
              </div>
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Version
                </div>
                <div style={{ fontSize: '0.85rem' }}>{data.version}</div>
              </div>
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Uptime (seconds)
                </div>
                <div style={{ fontSize: '0.85rem' }}>{Math.floor(data.uptime)}</div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem'
              }}
            >
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  DB status
                </div>
                <div style={{ fontSize: '0.85rem' }}>{data.db && data.db.ok ? 'Connected' : 'Error'}</div>
              </div>
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  Started at
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  {data.startedAt ? new Date(data.startedAt).toLocaleString() : 'Unknown'}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
