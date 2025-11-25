const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function CodeStats({ code, link, notFound }) {
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
            <a href="/health" style={{ color: '#4b5563' }}>
              Health
            </a>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Stats</h1>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          Details for code <code>{code}</code>.
        </p>

        {notFound ? (
          <div className="card" style={{ borderColor: '#fecaca', background: '#fef2f2', color: '#b91c1c' }}>
            No link found for this code. It may have been deleted.
          </div>
        ) : (
          <section className="card" style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Short URL</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                {BACKEND_URL.replace(/\/$/, '')}/{link.code}
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>Target URL</div>
              <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#1d4ed8' }}>
                {link.url}
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Total clicks</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{link.totalClicks}</div>
              </div>
              <div className="card" style={{ padding: '0.75rem', borderColor: '#e5e7eb' }}>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Last clicked</div>
                <div style={{ fontSize: '0.85rem' }}>
                  {link.formattedLastClickedAt || 'Never'}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const code = params.code;
  try {
    const res = await fetch(`${BACKEND_URL}/api/links/${encodeURIComponent(code)}`);
    if (res.status === 404) {
      return { props: { code, notFound: true } };
    }
    const data = await res.json();

    const formattedLastClickedAt = data.lastClickedAt
      ? new Date(data.lastClickedAt).toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit'
        })
      : null;

    return {
      props: {
        code,
        link: {
          ...data,
          formattedLastClickedAt
        },
        notFound: false
      }
    };
  } catch (e) {
    return { props: { code, notFound: true } };
  }
}
