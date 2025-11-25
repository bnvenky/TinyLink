import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const [url, setUrl] = useState('');
  const [code, setCode] = useState('');
  const [urlError, setUrlError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/links`);
        const data = await res.json();
        setLinks(data.links || []);
      } catch (e) {
        setError('Failed to load links');
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setUrlError('');
    setCodeError('');
    setSuccess('');

    if (!url) {
      setUrlError('Please provide a URL');
      return;
    }

    try {
      const parsed = new URL(url);
      if (!(parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
        setUrlError('URL must start with http or https');
        return;
      }
    } catch {
      setUrlError('Please enter a valid URL');
      return;
    }

    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
      setCodeError('Code must be 6-8 letters or numbers');
      return;
    }

    setCreating(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: code || undefined })
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setCodeError(data.message || 'Code already exists');
      } else if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'InvalidUrl') {
          setUrlError(data.message || 'Invalid URL');
        } else {
          setCodeError(data.message || 'Invalid code');
        }
      } else if (!res.ok) {
        setUrlError('Unexpected error, please try again');
      } else {
        const created = await res.json();
        setSuccess('Link created successfully');
        setUrl('');
        setCode('');
        setLinks(prev => [{
          code: created.code,
          url: created.url,
          totalClicks: created.totalClicks,
          lastClickedAt: created.lastClickedAt
        }, ...prev]);
      }
    } catch (e) {
      setUrlError('Network error, please try again');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(codeToDelete) {
    if (!confirm(`Delete short link ${codeToDelete}?`)) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/links/${encodeURIComponent(codeToDelete)}`, {
        method: 'DELETE'
      });
      if (res.status === 204) {
        setLinks(prev => prev.filter(l => l.code !== codeToDelete));
      }
    } catch {
      // ignore for now
    }
  }

  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch {
      // ignore
    }
  }

  const filteredLinks = links.filter(link => {
    if (!filter) return true;
    const lower = filter.toLowerCase();
    return (
      link.code.toLowerCase().includes(lower) ||
      (link.url || '').toLowerCase().includes(lower)
    );
  });

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
            <span style={{ color: '#111827', fontWeight: 500 }}>Dashboard</span>
            <span style={{ color: '#d1d5db' }}>|</span>
            <a href="/health" style={{ color: '#4b5563' }}>
              Health
            </a>
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: '1.5rem', paddingBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.25rem' }}>Dashboard</h1>
        <p className="text-muted" style={{ marginBottom: '1rem' }}>
          Create and manage short links via the Express backend.
        </p>

        <section className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Create a new short link</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Target URL *</label>
              <input
                className="input"
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
              />
              {urlError && <div className="text-error" style={{ marginTop: '0.2rem' }}>{urlError}</div>}
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500 }}>Custom code (optional)</label>
              <input
                className="input"
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="6-8 letters or numbers"
              />
              <div className="text-muted" style={{ marginTop: '0.15rem' }}>If left blank, a random code will be generated.</div>
              {codeError && <div className="text-error" style={{ marginTop: '0.2rem' }}>{codeError}</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create link'}
              </button>
              {success && <span className="text-success">{success}</span>}
            </div>
          </form>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600 }}>All links</h2>
            <input
              className="input"
              style={{ maxWidth: '260px' }}
              placeholder="Filter by code or URL..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>

          {loading && <div className="text-muted">Loading links...</div>}
          {error && <div className="text-error">{error}</div>}

          {!loading && !links.length && !error && (
            <div className="card text-muted">No links yet. Create your first short link above.</div>
          )}

          {!loading && filteredLinks.length > 0 && (
            <div className="card" style={{ marginTop: '0.5rem' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Short URL</th>
                      <th>Target URL</th>
                      <th>Clicks</th>
                      <th>Last clicked</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLinks.map(link => {
                      const shortUrl = `${BACKEND_URL.replace(/\/$/, '')}/${link.code}`;
                      return (
                        <tr key={link.code}>
                          <td>
                            <a href={`${BACKEND_URL.replace(/\/$/, '')}/code/${link.code}`} target="_blank" rel="noreferrer" className="badge">
                              {link.code}
                            </a>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem' }}>{shortUrl}</span>{' '}
                            <button
                              type="button"
                              className="btn-primary"
                              style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', marginLeft: '0.25rem' }}
                              onClick={() => handleCopy(shortUrl)}
                            >
                              Copy
                            </button>
                          </td>
                          <td>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>{link.url}</span>
                          </td>
                          <td>{link.totalClicks}</td>
                          <td>{link.lastClickedAt ? new Date(link.lastClickedAt).toLocaleString() : 'Never'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="btn-danger" onClick={() => handleDelete(link.code)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
