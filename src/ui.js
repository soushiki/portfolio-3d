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

function tagList(tags) {
  const ul = document.createElement('ul');
  ul.className = 'tags';
  for (const tag of tags) {
    const li = document.createElement('li');
    li.textContent = tag;
    ul.append(li);
  }
  return ul;
}

// Live/Case study/Code for projects; contact zones bring their own link list.
export function linksFor(item) {
  if (item.links) return item.links;
  const links = [];
  if (item.live) links.push({ label: 'Live', href: item.live });
  if (item.caseStudy) links.push({ label: 'Case study', href: item.caseStudy });
  if (item.code) links.push({ label: 'Code', href: item.code });
  return links;
}

export function createUI({ projects }) {
  const loader = $('loader');
  const card = $('card');
  const list = $('list');
  let onCardClosed = () => {};
  let onGoTo = null;

  const closeList = () => {
    list.hidden = true;
    $('list-btn').focus();
  };

  $('card-close').addEventListener('click', () => {
    card.hidden = true;
    onCardClosed();
  });
  $('list-btn').addEventListener('click', () => {
    list.hidden = false;
    $('list-close').focus();
  });
  $('list-close').addEventListener('click', closeList);
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!list.hidden && !document.body.classList.contains('is-fallback')) closeList();
    else if (!card.hidden) $('card-close').click();
  });

  // Fill the project list once; it doubles as the no-WebGL fallback.
  const items = $('list-items');
  for (const p of projects) {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
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
    const go = document.createElement('button');
    go.type = 'button';
    go.className = 'list-goto';
    go.textContent = 'Drive there';
    go.addEventListener('click', () => {
      list.hidden = true;
      onGoTo?.(p.id);
    });
    links.append(go);
    li.append(h3, desc, tagList(p.tags), links);
    items.append(li);
  }

  return {
    progress(fraction, message) {
      $('loader-bar').style.width = `${Math.round(fraction * 100)}%`;
      if (message) $('loader-status').textContent = message;
    },

    ready(onStart) {
      this.progress(1, 'Ready.');
      const btn = $('start-btn');
      btn.hidden = false;
      btn.focus();
      btn.addEventListener(
        'click',
        () => {
          loader.classList.add('is-done');
          setTimeout(() => (loader.hidden = true), 650);
          $('hud').hidden = false;
          onStart();
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
    },

    openCard(item) {
      $('card-title').textContent = item.title;
      $('card-desc').textContent = item.description;
      $('card-tags').replaceWith(Object.assign(tagList(item.tags), { id: 'card-tags' }));
      const links = $('card-links');
      links.replaceChildren(...linksFor(item).map((l, i) => link(l.label, l.href, i === 0)));
      card.hidden = false;
      $('zone-hint').hidden = true;
    },

    closeCard() {
      card.hidden = true;
    },

    get cardOpen() {
      return !card.hidden;
    },

    onCardClosed(fn) {
      onCardClosed = fn;
    },

    onGoTo(fn) {
      onGoTo = fn;
    },

    showHint(show) {
      $('zone-hint').hidden = !show;
    },
  };
}
