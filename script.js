
/******************************
 * Parking Dashboard Frontend
 * - Replace mock fetch with real endpoint
 * - Designed to be clear and extensible
 ******************************/

// ----------------------
// Utility and mock data
// ----------------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Example data structure for each lot:
// { id, name, totalSpaces, freeSpaces, status: 'open'|'limited'|'closed', lastUpdated: ISOString, meta:{zone:'A', notes:'...'} }
const sampleData = [
  {id: 'lot-01', name: 'Asian American Resource and Cultural Center', abbreviation: 'AACC', totalSpaces: 100, freeSpaces: 50, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-02', name: 'Agricultural and Biological Engineering', abbreviation: 'ABE', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-03', name: 'Aspire At Discovery Park Bldg A', abbreviation: 'ADPA', totalSpaces: 150, freeSpaces: 10, status: 'limited', lastUpdated: new Date().toISOString()},
  {id: 'lot-04', name: 'Aspire At Discovery Park Bldg B', abbreviation: 'ADPB', totalSpaces: 300, freeSpaces: 250, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-05', name: 'Agricultural Administration Building', abbreviation: 'AGAD', totalSpaces: 200, freeSpaces: 0, status: 'closed', lastUpdated: new Date().toISOString()},
  {id: 'lot-06', name: 'Boilermaker Aquatic Center', abbreviation: 'AQUA', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-07', name: 'Armory', abbreviation: 'AR', totalSpaces: 100, freeSpaces: 50, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-08', name: 'Neil Armstrong Hall of Engineering', abbreviation: 'ARMS', totalSpaces: 200, freeSpaces: 0, status: 'closed', lastUpdated: new Date().toISOString()},
  {id: 'lot-09', name: 'Black Culturual Center', abbreviation: 'BCC', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-10', name: 'Biochemistry Building', abbreviation: 'BCHM', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-11', name: 'Bindley Bioscience Center', abbreviation: 'BIND', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-12', name: 'Steven C. Beering Hall of Liberal Arts & Education', abbreviation: 'BRNG', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-13', name: 'Hebert C. Brown Laboratory of Chemistry', abbreviation: 'BRWN', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-14', name: 'Chaney-Hale Hall of Science', abbreviation: 'CHAS', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-15', name: 'Class of 1950 Lecture Hall', abbreviation: 'Cl50', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-16', name: 'Cordova Recreational Sports Center', abbreviation: 'CREC', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-17', name: 'Edward C. Elliott Hall of Music', abbreviation: 'ELLT', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-18', name: 'Fred and Mary Ford Dining Court', abbreviation: 'FORD', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-13', name: 'Forny Hall of  Chemical Engineering', abbreviation: 'FRNY', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-13', name: 'Grissom Hall', abbreviation: 'GRIS', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-13', name: 'Felix Haas Hall', abbreviation: 'HAAS', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()},
  {id: 'lot-13', name: '', abbreviation: '', totalSpaces: 200, freeSpaces: 150, status: 'open', lastUpdated: new Date().toISOString()}
  // Add more lots
];

// ----------------------
// Replace this with your real API call
// ----------------------
async function fetchParkingData() {
  // Example: return fetch('/api/parking').then(r => r.json());
  // For now we simulate latency and occasional errors.
  await new Promise(res => setTimeout(res, 600)); // simulate network
  // Simulate success:
  return sampleData.map(d => ({ ...d, lastUpdated: new Date().toISOString() }));

  // To simulate an error during development uncomment:
  // throw new Error('Simulated network error');
}

// ----------------------
// Rendering helpers
// ----------------------
const lotsGrid = $('#lotsGrid');
const emptyState = $('#emptyState');
const errorState = $('#errorState');
const statusText = $('#statusText');
const lastUpdatedText = $('#lastUpdated');

function colorForRatio(ratio) {
  // ratio: 0..1
  if (ratio === null) return 'var(--muted)';
  if (ratio > 0.5) return getComputedStyle(document.documentElement).getPropertyValue('--success');
  if (ratio > 0.15) return getComputedStyle(document.documentElement).getPropertyValue('--warn');
  return getComputedStyle(document.documentElement).getPropertyValue('--danger');
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch(e) { return iso; }
}

function makeLotCard(lot) {
  const ratio = (lot.totalSpaces && lot.totalSpaces > 0) ? Math.max(0, Math.min(1, lot.freeSpaces / lot.totalSpaces)) : null;
  const pct = ratio === null ? '—' : Math.round(ratio * 100) + '%';
  const color = colorForRatio(ratio);
  const freeText = Number.isFinite(lot.freeSpaces) ? `${lot.freeSpaces}` : '—';

  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', `${lot.name}: ${freeText} free of ${lot.totalSpaces}`);
  card.innerHTML = `
    <div class="lot-thumb" aria-hidden="true">${lot.abbreviation}</div>
    <div class="lot-info">
      <p class="lot-name">${escapeHtml(lot.name)}</p>
      <p class="lot-sub">${lot.totalSpaces} total · status: <strong style="text-transform:capitalize">${lot.status}</strong></p>
      <p class="small muted">Updated: ${formatTime(lot.lastUpdated)}</p>
    </div>
    <div class="lot-stats">
      <div class="count" aria-hidden="false">${freeText} <span class="small muted">free</span></div>
      <div class="progress" aria-hidden="true" title="${pct} available">
        <div class="bar" style="width:${ratio===null?0:Math.round(ratio*100)}%; background:${color};"></div>
      </div>
      <div class="status-pill" style="background:rgba(255,255,255,0.02)">
        ${pct}
      </div>
    </div>
  `;
  return card;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

// ----------------------
// App state and interactions
// ----------------------
let latestData = [];
let autoTimer = null;

async function refreshData({ showStatus=true } = {}) {
  // UI state
  if (showStatus) {
    statusText.textContent = 'Fetching parking data…';
    $('#refreshBtn').disabled = true;
    $('#refreshBtn').textContent = 'Refreshing...';
  }
  errorState.hidden = true;
  try {
    const data = await fetchParkingData();
    latestData = Array.isArray(data) ? data : [];
    renderLotsFromState();
    lastUpdatedText.textContent = 'Last refreshed: ' + new Date().toLocaleString();
    if (showStatus) statusText.textContent = `Loaded ${latestData.length} lots.`;
  } catch (err) {
    console.error(err);
    errorState.hidden = false;
    statusText.textContent = 'Error loading data.';
    lastUpdatedText.textContent = 'Last refreshed: —';
  } finally {
    if (showStatus) {
      $('#refreshBtn').disabled = false;
      $('#refreshBtn').textContent = 'Refresh';
    }
  }
}

function getFilters() {
  return {
    q: $('#search').value.trim().toLowerCase(),
    filter: $('#filter').value,
    sort: $('#sort').value
  };
}

function renderLotsFromState() {
  const { q, filter, sort } = getFilters();
  let items = latestData.slice();

  // filter
  if (filter !== 'all') {
    items = items.filter(l => l.status === filter);
  }

  // search
  if (q) {
    items = items.filter(l => l.name.toLowerCase().includes(q) || (l.meta && JSON.stringify(l.meta).toLowerCase().includes(q)));
  }

  // sort
  items.sort((a,b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'free-desc') return (b.freeSpaces || 0) - (a.freeSpaces || 0);
    if (sort === 'free-asc') return (a.freeSpaces || 0) - (b.freeSpaces || 0);
    if (sort === 'percent-desc') {
      const pa = a.totalSpaces? (a.freeSpaces / a.totalSpaces) : -1;
      const pb = b.totalSpaces? (b.freeSpaces / b.totalSpaces) : -1;
      return pb - pa;
    }
    return 0;
  });

  // render
  lotsGrid.innerHTML = '';
  if (!items.length) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    items.forEach(lot => {
      lotsGrid.appendChild(makeLotCard(lot));
    });
  }
}

// ----------------------
// Auto-refresh handling
// ----------------------
function startAutoRefresh() {
  stopAutoRefresh();
  const seconds = Math.max(5, Number($('#interval').value) || 30);
  autoTimer = setInterval(() => refreshData({ showStatus: false }), seconds * 1000);
  statusText.textContent = `Auto-refresh every ${seconds}s`;
}
function stopAutoRefresh() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
}

// ----------------------
// DOM wiring
// ----------------------
function wireEvents() {
  $('#refreshBtn').addEventListener('click', () => refreshData());
  $('#retryBtn').addEventListener('click', () => refreshData());
  $('#search').addEventListener('input', () => renderLotsFromState());
  $('#filter').addEventListener('change', () => renderLotsFromState());
  $('#sort').addEventListener('change', () => renderLotsFromState());
  $('#autoToggle').addEventListener('change', (e) => {
    if (e.target.checked) startAutoRefresh(); else stopAutoRefresh();
  });
  $('#interval').addEventListener('change', () => {
    if ($('#autoToggle').checked) startAutoRefresh();
  });

  // Keyboard: press Enter in search to force refresh (optional)
  $('#search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') refreshData();
  });
}

// ----------------------
// Start the app
// ----------------------
(function init(){
  wireEvents();
  // initial load: render sample placeholders quickly
  latestData = sampleData.map(d => ({...d}));
  renderLotsFromState();
  lastUpdatedText.textContent = 'Last refreshed: ' + new Date().toLocaleString();
  // then fetch real (or mock) data to update
  refreshData({ showStatus: false }).catch(()=>{/*already handled*/});
})();

// Expose debug in console for hackathon devs
window.__parkingDashboard = {
  refreshData, getState: () => latestData, render: renderLotsFromState
};
