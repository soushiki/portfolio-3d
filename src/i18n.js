// Language is chosen once at startup: ?lang= > localStorage > browser language.
function resolveLang() {
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'es' || q === 'en') return q;
  } catch {}
  try {
    const s = localStorage.getItem('lang');
    if (s === 'es' || s === 'en') return s;
  } catch {}
  return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
}

export const LANG = resolveLang();

const STRINGS = {
  en: {
    docTitle: 'Sebastian Herrera · Planets of Code',
    docDesc: "A guided comic-book tour of Sebastian Herrera's projects, one small planet per project. A plain list, resume and contact are one click away.",
    coverIssue: 'Issue #1',
    loaderTitle: 'Planets of Code',
    loaderSub: 'A guided tour of my projects, one small planet each.',
    loadingWorld: 'Loading the planets…',
    loadingFonts: 'Inking the pages…',
    loadingEngine: 'Loading the engine…',
    buildingWorld: 'Building the planets…',
    ready: 'Ready.',
    start: 'Start the tour',
    seeList: 'Just show me the projects',
    resume: 'Resume',
    contact: 'Contact',
    hintKeys: '← → walk · Space jump · Enter next stop · L list',
    hintTouch: 'Hold ◀ ▶ to walk · tap Next to fly on',
    skip: 'Simple portfolio →',
    allProjects: 'All projects',
    allProjectsShort: 'List',
    simplePortfolio: 'Simple portfolio',
    simplePortfolioShort: 'Simple site',
    next: 'Next',
    nextTo: 'Next: {x}',
    back: 'Back',
    jump: 'Jump',
    walkLeft: 'Walk left',
    walkRight: 'Walk right',
    launchHint: 'Space / Jump on the star to fly to the next planet',
    planets: 'Planets',
    planetN: 'Planet {n} of {total}: {x}',
    catFound: 'Hidden cat found: {n} of {total}',
    close: 'Close',
    projects: 'Projects',
    featured: 'On the tour',
    earlier: 'Earlier builds',
    earlierNote: 'Course and practice projects, kept here for reference.',
    driveThere: 'Fly there',
    live: 'Live',
    caseStudy: 'Case study',
    code: 'Code',
    noscript: 'This 3D portfolio needs JavaScript.',
    noscriptLink: 'Open the simple portfolio',
    noWebgl: "Your browser can't run the 3D tour (WebGL is unavailable), so here are all the projects.",
    startFailed: 'Something went wrong while starting the 3D tour, so here are all the projects.',
    listNote: 'Every project, no game needed.',
    langLabel: 'Language',
    canvasLabel: 'Comic-style 3D tour: a cat astronaut walks around small planets, one per project',
  },
  es: {
    docTitle: 'Sebastian Herrera · Planetas de código',
    docDesc: 'Un recorrido guiado estilo cómic por los proyectos de Sebastian Herrera, un planeta pequeño por proyecto. La lista simple, la hoja de vida y el contacto están a un clic.',
    coverIssue: 'Número 1',
    loaderTitle: 'Planetas de código',
    loaderSub: 'Un recorrido guiado por mis proyectos, un planeta pequeño cada uno.',
    loadingWorld: 'Cargando los planetas…',
    loadingFonts: 'Entintando las páginas…',
    loadingEngine: 'Cargando el motor…',
    buildingWorld: 'Construyendo los planetas…',
    ready: 'Listo.',
    start: 'Empezar el recorrido',
    seeList: 'Solo muéstrame los proyectos',
    resume: 'Hoja de vida',
    contact: 'Contacto',
    hintKeys: '← → caminar · Espacio saltar · Enter siguiente parada · L lista',
    hintTouch: 'Mantén ◀ ▶ para caminar · toca Siguiente para volar',
    skip: 'Portafolio simple →',
    allProjects: 'Todos los proyectos',
    allProjectsShort: 'Lista',
    simplePortfolio: 'Portafolio simple',
    simplePortfolioShort: 'Versión simple',
    next: 'Siguiente',
    nextTo: 'Siguiente: {x}',
    back: 'Atrás',
    jump: 'Saltar',
    walkLeft: 'Caminar a la izquierda',
    walkRight: 'Caminar a la derecha',
    launchHint: 'Espacio / Saltar sobre la estrella para volar al siguiente planeta',
    planets: 'Planetas',
    planetN: 'Planeta {n} de {total}: {x}',
    catFound: 'Gato escondido encontrado: {n} de {total}',
    close: 'Cerrar',
    projects: 'Proyectos',
    featured: 'En el recorrido',
    earlier: 'Proyectos anteriores',
    earlierNote: 'Proyectos de cursos y de práctica, guardados como referencia.',
    driveThere: 'Volar allí',
    live: 'En vivo',
    caseStudy: 'Caso de estudio',
    code: 'Código',
    noscript: 'Este portafolio 3D necesita JavaScript.',
    noscriptLink: 'Abrir el portafolio simple',
    noWebgl: 'Tu navegador no puede ejecutar el recorrido 3D (WebGL no está disponible), así que aquí están todos los proyectos.',
    startFailed: 'Algo salió mal al iniciar el recorrido 3D, así que aquí están todos los proyectos.',
    listNote: 'Todos los proyectos, sin jugar.',
    langLabel: 'Idioma',
    canvasLabel: 'Recorrido 3D estilo cómic: un gato astronauta camina por planetas pequeños, uno por proyecto',
  },
};

export const t = (key, vars) => {
  let s = STRINGS[LANG][key] ?? STRINGS.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
};

// Picks `field_es` in Spanish when present, else `field`.
export const pick = (item, field) => (LANG === 'es' && item[`${field}_es`]) || item[field];

// Appends ?lang=es to links into the sister sites (they read ?lang).
export const withLang = (href) => {
  if (LANG !== 'es' || !href) return href;
  const u = new URL(href);
  if (u.hostname === 'github.com') return href;
  u.searchParams.set('lang', 'es');
  return u.toString();
};

// Returns a copy of a data item in the active language.
export function localize(item) {
  const out = { ...item, title: pick(item, 'title'), description: pick(item, 'description'), tags: pick(item, 'tags') };
  if (item.links) out.links = item.links.map((l) => ({ ...l, label: pick(l, 'label') }));
  return out;
}

// Applies the static page text (html lang, title, meta description, data-i18n nodes) and wires the toggle.
export function applyStaticText() {
  document.documentElement.lang = LANG;
  document.title = t('docTitle');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('docDesc'));
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria));
  for (const a of document.querySelectorAll('a[data-lang-link]')) a.href = withLang(a.href);
  for (const group of document.querySelectorAll('.lang-toggle')) {
    group.setAttribute('aria-label', t('langLabel'));
    for (const b of group.querySelectorAll('button')) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === LANG));
      b.addEventListener('click', () => {
        if (b.dataset.lang === LANG) return;
        try {
          localStorage.setItem('lang', b.dataset.lang);
        } catch {}
        const u = new URL(location.href);
        u.searchParams.set('lang', b.dataset.lang);
        location.href = u.toString();
      });
    }
  }
}
