// Shared navigation and behaviour for every page.
(function () {
  const PAGES = [
    { id: 'match', href: 'match.html', label: 'Before a match', short: 'Match',
      icon: '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>' },
    { id: 'process', href: 'tonys-play.html', label: "Tony's Play", short: 'Process',
      icon: '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="12" r="2.5"/><path d="M7.5 12h9"/><path d="M14 9l3 3-3 3"/>' },
    { id: 'coaching', href: './', label: 'Coaching', short: 'Coaching',
      icon: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M8 7h6"/>' },
    { id: 'search', href: 'search.html', label: 'Search', short: 'Search',
      icon: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>' },
  ];
  const current = document.body.dataset.page;
  const svg = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const cur = id => (id === current ? ' aria-current="page"' : '');

  // Top bar
  const top = document.querySelector('.topbar');
  if (top) {
    const q = new URLSearchParams(location.search).get('q') || '';
    top.innerHTML =
      `<a class="brand" href="match.html"><img src="favicon.svg" alt="">Pool</a>` +
      `<nav class="topnav" aria-label="Pages">${PAGES.filter(p => p.id !== 'search')
        .map(p => `<a href="${p.href}"${cur(p.id)}>${p.label}</a>`).join('')}</nav>` +
      `<form class="topsearch" action="search.html" role="search"><input type="search" name="q" ` +
      `placeholder="Search rules - press /" aria-label="Search" autocomplete="off" value="${q.replace(/"/g, '&quot;')}"></form>`;
    if (current === 'search') top.querySelector('.topsearch').remove();
  }

  // Bottom tab bar (phone)
  const tabs = document.createElement('nav');
  tabs.className = 'tabbar';
  tabs.setAttribute('aria-label', 'Pages');
  tabs.innerHTML = PAGES.map(p => `<a href="${p.href}"${cur(p.id)}>${svg(p.icon)}${p.short}</a>`).join('');
  document.body.appendChild(tabs);

  // "/" focuses search
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || /input|textarea/i.test(document.activeElement.tagName)) return;
    const box = document.querySelector('.search-box input, .topsearch input');
    if (box) { e.preventDefault(); box.focus(); box.select(); }
  });

  // Open the section a link points at (and any section containing the target)
  function openTarget(hash) {
    if (!hash || hash.length < 2) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    let d = el.closest('details');
    while (d) { d.open = true; d = d.parentElement.closest('details'); }
    const go = () => {
      const bar = document.querySelector('.topbar'), toc = document.querySelector('.toc');
      let off = (bar ? bar.offsetHeight : 0) + 8;
      if (toc && getComputedStyle(toc).position === 'sticky' && toc.offsetWidth > window.innerWidth - 40) off += toc.offsetHeight;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - off);
    };
    requestAnimationFrame(go);
    if (document.readyState !== 'complete') window.addEventListener('load', go, { once: true });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname === location.pathname && url.hash) { e.preventDefault(); history.replaceState(null, '', url.hash); openTarget(url.hash); }
  });
  window.addEventListener('hashchange', () => openTarget(location.hash));
  openTarget(location.hash);

  // Expand / collapse all
  document.querySelectorAll('[data-expand]').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.dataset.expand === 'all';
    document.querySelectorAll('details.sec').forEach(d => { d.open = open; });
  }));

  // Highlight the section in view in the index
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (links.length && 'IntersectionObserver' in window) {
    const byId = Object.fromEntries(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      const a = byId[e.target.id];
      if (!a) return;
      links.forEach(l => l.classList.remove('active'));
      a.classList.add('active');
      const ol = a.closest('ol');
      if (ol.scrollWidth > ol.clientWidth) ol.scrollLeft = a.offsetLeft - ol.clientWidth / 2 + a.clientWidth / 2;
    }), { rootMargin: '-70px 0px -75% 0px' });
    links.forEach(a => { const s = document.getElementById(a.getAttribute('href').slice(1)); if (s) io.observe(s); });
  }
})();
