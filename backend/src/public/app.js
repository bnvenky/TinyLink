(function () {
  const form = document.getElementById('create-link-form');
  const urlInput = document.getElementById('url');
  const codeInput = document.getElementById('code');
  const urlError = document.getElementById('url-error');
  const codeError = document.getElementById('code-error');
  const submitBtn = document.getElementById('create-submit');
  const successMsg = document.getElementById('create-success');
  const filterInput = document.getElementById('filter-input');
  const tableBody = document.getElementById('links-table-body');

  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }

  function clearErrors() {
    if (urlError) {
      urlError.textContent = '';
      urlError.classList.add('hidden');
    }
    if (codeError) {
      codeError.textContent = '';
      codeError.classList.add('hidden');
    }
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden');
  }

  async function handleCreate(event) {
    if (!form) return;
    event.preventDefault();
    clearErrors();

    const url = urlInput.value.trim();
    const code = codeInput.value.trim();

    if (!url || !isValidUrl(url)) {
      showError(urlError, 'Please enter a valid http(s) URL.');
      return;
    }

    if (code && !/^[A-Za-z0-9]{6,8}$/.test(code)) {
      showError(codeError, 'Code must be 6-8 letters or numbers.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    if (successMsg) {
      successMsg.classList.add('hidden');
    }

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: code || undefined })
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        showError(codeError, data.message || 'Code already exists.');
      } else if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        if (data.error === 'InvalidUrl') {
          showError(urlError, data.message || 'Invalid URL.');
        } else {
          showError(codeError, data.message || 'Invalid code.');
        }
      } else if (!res.ok) {
        showError(urlError, 'Unexpected error. Please try again.');
      } else {
        form.reset();
        if (successMsg) {
          successMsg.textContent = 'Link created successfully.';
          successMsg.classList.remove('hidden');
        }
        window.location.reload();
      }
    } catch (e) {
      showError(urlError, 'Network error. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create link';
    }
  }

  function handleCopyClick(event) {
    const btn = event.target.closest('.copy-btn');
    if (!btn) return;

    const text = btn.getAttribute('data-copy');
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      })
      .catch(() => {
        // ignore
      });
  }

  async function handleDeleteClick(event) {
    const btn = event.target.closest('.delete-btn');
    if (!btn) return;
    const code = btn.getAttribute('data-code');
    if (!code) return;

    const row = btn.closest('tr');
    if (!confirm(`Delete short link ${code}?`)) return;

    btn.textContent = 'Deleting...';
    btn.disabled = true;

    try {
      const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });
      if (res.status === 204) {
        if (row && row.parentNode) {
          row.parentNode.removeChild(row);
        }
      } else {
        btn.textContent = 'Error';
      }
    } catch (e) {
      btn.textContent = 'Error';
    }
  }

  function handleFilterInput(event) {
    if (!tableBody) return;
    const value = event.target.value.toLowerCase();
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row) => {
      const code = row.getAttribute('data-code') || '';
      const cells = Array.from(row.querySelectorAll('td'));
      const urlCell = cells[2];
      const urlText = urlCell ? urlCell.textContent.toLowerCase() : '';
      const match = code.toLowerCase().includes(value) || urlText.includes(value);
      row.style.display = match ? '' : 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', handleCreate);
  }

  document.addEventListener('click', function (event) {
    handleCopyClick(event);
    handleDeleteClick(event);
  });

  if (filterInput) {
    filterInput.addEventListener('input', handleFilterInput);
  }
})();
