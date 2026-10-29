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
    docTitle: 'Sebastian Herrera · 3D Portfolio',
    docDesc: "Drive a small car around a low-poly world to discover Sebastian Herrera's projects.",
    loaderTitle: 'Portfolio, the driving edition',
    loadingWorld: 'Loading the world…',
    loadingFonts: 'Loading fonts…',
    loadingEngine: 'Loading the engine…',
    buildingWorld: 'Building the world…',
    ready: 'Ready.',
    start: 'Start driving',
    hintKeys: 'WASD / arrows to drive · Space to brake · R to reset',
    hintTouch: 'Drag the joystick (bottom left) to drive',
    skip: 'Skip to the simple portfolio →',
    allProjects: 'All projects',
    allProjectsShort: 'Projects',
    simplePortfolio: 'Simple portfolio',
    simplePortfolioShort: 'Simple site',
    joystick: 'Joystick: drag up to drive, sideways to steer, down to reverse',
    zoneHint: 'Drive onto a glowing pad to open a project',
    close: 'Close',
    steerLeft: 'Steer left',
    steerRight: 'Steer right',
    reverse: 'Reverse',
    accelerate: 'Accelerate',
    projects: 'Projects',
    driveThere: 'Drive there',
    live: 'Live',
    caseStudy: 'Case study',
    code: 'Code',
    noscript: 'This 3D portfolio needs JavaScript.',
    noscriptLink: 'Open the simple portfolio',
    noWebgl: "Your browser can't run the 3D world (WebGL is unavailable), so here are all the projects.",
    startFailed: 'Something went wrong while starting the 3D world, so here are all the projects.',
    langLabel: 'Language',
    signHiTitle: "Hi, I'm Sebastian Herrera",
    signHiSub: 'Drive onto the glowing pads to see my projects.',
    signContactTitle: 'Say hi',
    signContactSub: 'LinkedIn · GitHub',
    signContactTag: 'Open to work',
    signBridgeTitle: '← Data Science',
    signBridgeSub: 'Cross the bridge',
    signIslandTitle: 'Data Science',
    signIslandSub: 'Forecasting · A/B testing · ML',
    canvasLabel: '3D world: drive the car to discover projects',
  },
  es: {
    docTitle: 'Sebastian Herrera · Portafolio 3D',
    docDesc: 'Conduce un carro por un mundo low-poly y descubre los proyectos de Sebastian Herrera.',
    loaderTitle: 'Portafolio, edición para conducir',
    loadingWorld: 'Cargando el mundo…',
    loadingFonts: 'Cargando fuentes…',
    loadingEngine: 'Cargando el motor…',
    buildingWorld: 'Construyendo el mundo…',
    ready: 'Listo.',
    start: 'Empezar a conducir',
    hintKeys: 'WASD / flechas para conducir · Espacio para frenar · R para reiniciar',
    hintTouch: 'Arrastra el joystick (abajo a la izquierda) para conducir',
    skip: 'Ir al portafolio simple →',
    allProjects: 'Todos los proyectos',
    allProjectsShort: 'Proyectos',
    simplePortfolio: 'Portafolio simple',
    simplePortfolioShort: 'Versión simple',
    joystick: 'Joystick: arrastra hacia arriba para avanzar, a los lados para girar y hacia abajo para retroceder',
    zoneHint: 'Conduce sobre una plataforma brillante para abrir un proyecto',
    close: 'Cerrar',
    steerLeft: 'Girar a la izquierda',
    steerRight: 'Girar a la derecha',
    reverse: 'Reversa',
    accelerate: 'Acelerar',
    projects: 'Proyectos',
    driveThere: 'Ir allí',
    live: 'En vivo',
    caseStudy: 'Caso de estudio',
    code: 'Código',
    noscript: 'Este portafolio 3D necesita JavaScript.',
    noscriptLink: 'Abrir el portafolio simple',
    noWebgl: 'Tu navegador no puede ejecutar el mundo 3D (WebGL no está disponible), así que aquí están todos los proyectos.',
    startFailed: 'Algo salió mal al iniciar el mundo 3D, así que aquí están todos los proyectos.',
    langLabel: 'Idioma',
    signHiTitle: 'Hola, soy Sebastian Herrera',
    signHiSub: 'Conduce sobre las plataformas brillantes para ver mis proyectos.',
    signContactTitle: 'Saluda',
    signContactSub: 'LinkedIn · GitHub',
    signContactTag: 'Busco empleo',
    signBridgeTitle: '← Ciencia de datos',
    signBridgeSub: 'Cruza el puente',
    signIslandTitle: 'Ciencia de datos',
    signIslandSub: 'Pronósticos · Pruebas A/B · ML',
    canvasLabel: 'Mundo 3D: conduce el carro para descubrir proyectos',
  },
};

export const t = (key) => STRINGS[LANG][key] ?? STRINGS.en[key] ?? key;

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
