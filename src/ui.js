import { t, LANG } from './i18n.js';
import { RESUME } from './data.js';

const $ = (id) => document.getElementById(id);

function link(label, href, primary) {
  const a = document.createElement('a');
  a.className = primary ? 'btn btn-primary' : 'btn';
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = label;
  return a;
}

function tagList(tags = []) {
  const ul = document.createElement('ul');
  ul.className = 'tags';
  for (const tag of tags) {
    const li = document.createElement('li');
    li.textContent = tag;
    ul.append(li);
  }
  return ul;
}

// Live/Case study/Code for projects; intro, hub and contact bring their own link list.
export function linksFor(item) {
  if (item.links) return item.links;
  const links = [];
  if (item.live) links.push({ label: t('live'), href: item.live });
  if (item.caseStudy) links.push({ label: t('caseStudy'), href: item.caseStudy });
  if (item.code) links.push({ label: t('code'), href: item.code });
  return links;
}

// featured: [{ item, planet }] in tour order; earlier: plain items.
export function createUI({ featured, earlier, planets }) {
  const loader = $('loader');
  const card = $('card');
  const list = $('list');
  let onCardClosed = () => {};
  let onGoTo = null;
  let onNext = () => {};
  let onBack = () => {};
  let started = false;
  let lastFocus = null;

  for (const a of document.querySelectorAll('a[data-resume]')) a.href = RESUME[LANG] ?? RESUME.en;

  // --- Project list dialog (also the no-WebGL fallback) ---
  const openList = () => {
    lastFocus = document.activeElement;
    list.hidden = false;
    $('list-close').focus();
  };
  const closeList = () => {
    if (document.body.classList.contains('is-fallback')) return;
    list.hidden = true;
    (lastFocus && document.contains(lastFocus) && lastFocus !== document.body ? lastFocus : $('scene')).focus?.();
  };
  for (const el of document.querySelectorAll('[data-open-list]')) {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openList();
    });
  }
  $('list-close').addEventListener('click', closeList);
  // Keep Tab inside the open dialog.
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...list.querySelectorAll('a, button')].filter((el) => !el.closest('[hidden]'));
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!list.hidden) closeList();
      else if (!card.hidden) $('card-close').click();
      return;
    }
    if (e.code === 'KeyL' && list.hidden && started && !e.ctrlKey && !e.metaKey) openList();
  });

  const listItem = (p, withGo) => {
    const li = document.createElement('li');
    const h3 = document.createElement('h4');
    h3.textContent = p.title;
    const desc = document.createElement('p');
    desc.textContent = p.description;
    const links = document.createElement('div');
    links.className = 'list-links';
    for (const l of linksFor(p)) {
      const a = document.createElement('a');
      a.href = l.href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = l.label;
      links.append(a);
    }
    if (withGo) {
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'list-goto';
      go.textContent = t('driveThere');
      go.addEventListener('click', () => {
        list.hidden = true;
        if (!started) $('start-btn').click();
        onGoTo?.(p.id);
        $('scene').focus();
      });
      links.append(go);
    }
    li.append(h3, desc, tagList(p.tags), links);
    return li;
  };
  for (const { item, planet } of featured) {
    const li = listItem(item, true);
    li.style.setProperty('--planet', planet.color);
    $('list-featured').append(li);
  }
  for (const p of earlier) $('list-earlier').append(listItem(p, false));

  // --- Planet strip: one numbered button per planet ---
  const strip = $('strip');
  const stripButtons = planets.map((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'strip-dot';
    b.style.setProperty('--planet', p.color);
    b.textContent = String(p.index);
    b.setAttribute('aria-label', `${p.number} ${p.stops[0].item.title}`);
    b.title = p.stops[0].item.title;
    b.addEventListener('click', () => onGoTo?.(p.stops[0].item.id));
    strip.append(b);
    return b;
  });

  $('next-btn').addEventListener('click', () => onNext());
  $('back-btn').addEventListener('click', () => onBack());

  $('card-more').addEventListener('click', () => {
    const open = $('card-desc').classList.toggle('is-open');
    $('card-more').setAttribute('aria-expanded', String(open));
    $('card-more').textContent = t(open ? 'less' : 'more');
  });

  $('card-close').addEventListener('click', () => {
    card.hidden = true;
    onCardClosed();
  });

  let toastTimer = 0;
  const toast = (msg) => {
    const el = $('toast');
    el.textContent = msg;
    el.hidden = false;
    el.classList.remove('is-pop');
    void el.offsetWidth;
    el.classList.add('is-pop');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.hidden = true), 2600);
  };

  let lastCats = [];
  $('cats-reset').addEventListener('click', () => {
    try {
      localStorage.removeItem('p3d-cats');
    } catch {}
    location.reload();
  });

  let navNext = null;
  return {
    progress(fraction, message) {
      $('loader-bar').style.width = `${Math.round(fraction * 100)}%`;
      if (message) $('loader-status').textContent = message;
    },

    ready(onStart) {
      this.progress(1, t('ready'));
      const btn = $('start-btn');
      btn.disabled = false;
      if (list.hidden) btn.focus();
      btn.addEventListener(
        'click',
        () => {
          started = true;
          loader.classList.add('is-done');
          setTimeout(() => (loader.hidden = true), 500);
          $('hud').hidden = false;
          $('controls').hidden = false;
          onStart();
          $('scene').focus();
        },
        { once: true },
      );
    },

    showFallback(message) {
      document.body.classList.add('is-fallback');
      loader.hidden = true;
      $('scene').hidden = true;
      $('list-note').textContent = message;
      list.hidden = false;
      list.removeAttribute('aria-modal');
      list.setAttribute('role', 'main');
    },

    openCard(item, planet) {
      $('card-number').textContent = planet ? `${planet.number} · ${planet.stops[0].item.title}` : '';
      $('card-number').hidden = !planet || planet.stops.length < 2;
      $('card-title').textContent = item.title;
      $('card-desc').textContent = item.description;
      // Phones show two lines and a More button (CSS clamps); long text only.
      const more = $('card-more');
      $('card-desc').classList.remove('is-open');
      more.setAttribute('aria-expanded', 'false');
      more.textContent = t('more');
      more.hidden = item.description.length < 110;
      $('card-tags').replaceWith(Object.assign(tagList(item.tags), { id: 'card-tags' }));
      $('card-links').replaceChildren(...linksFor(item).map((l, i) => link(l.label, l.href, i === 0)));
      card.style.setProperty('--planet', planet?.color ?? '#FFD23F');
      card.hidden = false;
      card.classList.remove('is-pop');
      void card.offsetWidth;
      card.classList.add('is-pop');
      $('announce').textContent = item.title;
    },

    closeCard() {
      card.hidden = true;
    },

    // Fraction of the screen the open card covers, so the camera can frame around it.
    viewInset() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const hud = $('hud');
      const top = hud.hidden ? 0 : Math.min(0.25, hud.getBoundingClientRect().bottom / h);
      const controls = $('controls');
      const low = controls.hidden ? 0 : Math.min(0.2, (h - controls.getBoundingClientRect().top) / h);
      if (card.hidden) return { top, right: 0, bottom: low };
      const r = card.getBoundingClientRect();
      if (r.width < w * 0.7) return { top, right: Math.min(0.6, (w - r.left) / w), bottom: low };
      return { top, right: 0, bottom: Math.min(0.65, (h - r.top) / h) };
    },

    setPlanet(i) {
      stripButtons.forEach((b, k) => b.toggleAttribute('aria-current', k === i));
      const p = planets[i];
      $('announce').textContent = t('planetN', { n: i + 1, total: planets.length, x: p.stops[0].item.title });
    },

    setNav({ next, back }) {
      if (next !== navNext) {
        navNext = next;
        $('next-label').textContent = t('next');
        $('next-dest').textContent = next ? `: ${next}` : '';
        $('next-btn').setAttribute('aria-label', next ? t('nextTo', { x: next }) : t('next'));
        $('next-btn').disabled = !next;
      }
      $('back-btn').disabled = !back;
    },

    // dir: 1 = star to the next planet, -1 = star to the previous one, 0 = none.
    showLaunchHint(dir) {
      const el = $('launch-hint');
      el.hidden = !dir || !card.hidden;
      if (dir && el.dataset.dir !== String(dir)) {
        el.dataset.dir = String(dir);
        el.textContent = t(dir > 0 ? 'launchHint' : 'launchHintBack');
      }
    },

    // Fills the "Secret cats" section: cats = [{ id, name }] in CATS order, foundIds = found ids.
    setCats(foundIds, cats = lastCats) {
      lastCats = cats;
      if (!cats.length) return;
      $('cats-section').hidden = false;
      const found = new Set(foundIds);
      $('cats-count').textContent = t('catsCount', { n: cats.filter((c) => found.has(c.id)).length, total: cats.length });
      $('cats-list').replaceChildren(
        ...cats.map((c) => {
          const li = document.createElement('li');
          const on = found.has(c.id);
          li.textContent = on ? `${c.name} ✓` : '???';
          if (on) li.className = 'is-found';
          return li;
        }),
      );
    },

    foundCat(name, n, total) {
      toast(t('catFound', { x: name, n, total }));
    },

    // Reduced motion: a quick comic "panel" wipe instead of flying.
    panelCut() {
      const c = $('cut');
      c.classList.remove('is-on');
      void c.offsetWidth;
      c.classList.add('is-on');
    },

    onCardClosed(fn) {
      onCardClosed = fn;
    },
    onGoTo(fn) {
      onGoTo = fn;
    },
    onNav(next, back) {
      onNext = next;
      onBack = back;
    },
  };
}
