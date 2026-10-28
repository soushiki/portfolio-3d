import { localize, withLang } from './i18n.js';

// Content shown on the in-world signs and overlay cards.
export const SIMPLE_PORTFOLIO = 'https://sebherr.netlify.app';

export const CONTACT = {
  github: 'https://github.com/soushiki',
  linkedin: 'https://www.linkedin.com/in/sebastian-herrera-claro-23a0af/',
};

const RAW_PROJECTS = [
  {
    id: 'minoscreto',
    landmark: 'vault',
    title: 'Minoscreto',
    description:
      'Anonymizes Word documents before you paste them into an AI, then restores the real names in the answer. Everything runs in the browser, so nothing leaves your computer.',
    tags: ['React', 'Vite', 'Vitest', '.docx'],
    description_es:
      "Anonimiza documentos de Word antes de pegarlos en una IA y luego restaura los nombres reales en la respuesta. Todo se ejecuta en el navegador, así que nada sale de tu computador.",
    live: 'https://minoscreto.netlify.app/',
    caseStudy: `${SIMPLE_PORTFOLIO}/public/html/minoscreto.html`,
    code: 'https://github.com/soushiki/minoscreto',
  },
  {
    id: 'brasa',
    landmark: 'restaurant',
    title: 'Brasa Food & Drinks',
    description:
      'Landing page prototype for a Cartagena restaurant: smash burgers, wood-fired pizza and ribs, with menu, locations and ordering sections.',
    tags: ['HTML', 'CSS', 'Responsive'],
    description_es:
      "Prototipo de página de inicio para un restaurante de Cartagena: hamburguesas smash, pizza al horno de leña y costillas, con secciones de menú, sedes y pedidos.",
    tags_es: ["HTML", "CSS", "Responsive"],
    live: 'https://protorest.netlify.app/',
    code: 'https://github.com/soushiki/restaurant-prototype',
  },
  {
    id: 'ingresos',
    landmark: 'bank',
    title: 'Ingresos App',
    description:
      "Bookkeeping template for restaurants: reads photos and PDFs of receipts and POS cash-closing reports with OCR and a local vision model, then builds the day's accounting ledger and exports it to Excel.",
    tags: ['Python', 'OCR', 'Ollama', 'Excel'],
    description_es:
      "Plantilla de contabilidad para restaurantes: lee fotos y PDFs de recibos y de cierres de caja del POS con OCR y un modelo de visión local, luego arma el libro contable del día y lo exporta a Excel.",
    caseStudy: `${SIMPLE_PORTFOLIO}/public/html/ingresos.html`,
    code: 'https://github.com/soushiki/ingresos-app',
  },
  {
    id: 'formato',
    landmark: 'hospital',
    title: 'Formato Médico',
    description:
      "Fills a physician's lab orders, prescriptions and certificates as PDFs that match the printed form, with an offline ICD-10 search. One React codebase for web and Android.",
    tags: ['React', 'jsPDF', 'Capacitor', 'Android'],
    description_es:
      "Llena órdenes de laboratorio, fórmulas médicas y certificados como PDFs idénticos al formato impreso, con búsqueda CIE-10 sin conexión. Un solo código en React para web y Android.",
    caseStudy: `${SIMPLE_PORTFOLIO}/public/html/formato-medico.html`,
  },
  {
    id: 'davinci',
    landmark: 'bookStack',
    title: 'Da Vinci Diary',
    description: 'Markdown notes app with login and a Firebase database.',
    tags: ['React', 'Next.js', 'Firebase'],
    description_es:
      "App de notas en Markdown con inicio de sesión y base de datos en Firebase.",
    live: 'https://davincidiary.netlify.app/',
    code: 'https://github.com/soushiki/notes-app',
  },
  {
    id: 'apod',
    landmark: 'observatory',
    title: 'NASA APOD',
    description:
      "Shows NASA's Astronomy Picture of the Day from the APOD API, with responses cached in local storage.",
    tags: ['React', 'Vite', 'REST API'],
    description_es:
      "Muestra la Imagen Astronómica del Día de la NASA desde la API de APOD, con las respuestas guardadas en el almacenamiento local.",
    live: 'https://apod-nasa-herrera.netlify.app/',
    code: 'https://github.com/soushiki/nasa-app',
  },
  {
    id: 'gym',
    title_es: 'Generador de rutinas de gimnasio',
    landmark: 'gym',
    title: 'Gym Routine Generator',
    description: 'Generates a random workout based on your goals. Routine data courtesy of @smoljames.',
    tags: ['React', 'Tailwind CSS'],
    description_es:
      "Genera una rutina de ejercicios aleatoria según tus objetivos. Datos de rutinas cortesía de @smoljames.",
    live: 'https://swollymolly.netlify.app/',
    code: 'https://github.com/soushiki/gym-app',
  },
  {
    id: 'todo',
    title_es: 'App de tareas',
    landmark: 'clipboard',
    title: 'Todo App',
    description: 'CRUD todo list built with React hooks.',
    tags: ['React', 'Vite'],
    description_es:
      "Lista de tareas CRUD hecha con hooks de React.",
    live: 'https://bruh-todo-app.netlify.app/',
    code: 'https://github.com/soushiki/todo-list',
  },
  {
    id: 'gacha',
    landmark: 'gachaMachine',
    title: 'Whisker Gacha',
    description:
      'Capsule-machine gacha game with 21 cats with powers: soft and hard pity, a 50/50 rate-up system, a treat jar and daily challenges, and an animated Mythic reveal.',
    tags: ['JavaScript', 'CSS animation', 'SVG'],
    description_es:
      "Juego gacha de máquina de cápsulas con 21 gatos con poderes: pity suave y duro, sistema de 50/50 con rate-up, frasco de premios y retos diarios, y una revelación Mítica animada.",
    tags_es: ["JavaScript", "Animación CSS", "SVG"],
    live: withLang(`${SIMPLE_PORTFOLIO}/public/html/cat-gacha.html`),
    code: 'https://github.com/soushiki/portfolio/blob/main/public/html/cat-gacha.html',
  },
  {
    id: 'reddit',
    landmark: 'forumHall',
    title: 'Reddit Plus',
    description: 'Reddit client built on the Reddit API, with state managed in Redux.',
    tags: ['React', 'Redux', 'REST API'],
    description_es:
      "Cliente de Reddit construido sobre la API de Reddit, con el estado manejado en Redux.",
    code: 'https://github.com/soushiki/reddit-plus',
  },
  {
    id: 'jammming',
    landmark: 'speakers',
    title: 'Jammming',
    description: 'Search Spotify and build playlists using the Spotify Web API.',
    tags: ['React', 'Spotify API', 'OAuth'],
    description_es:
      "Busca en Spotify y crea listas de reproducción con la Spotify Web API.",
    code: 'https://github.com/soushiki/Jammming',
  },
];

// Data science island: a hub pad on its plaza plus one pad per project.
const DATA_SCIENCE_SITE = 'https://soushiki.github.io/data-science';

const RAW_HUB = {
  id: 'ds-hub',
  title: 'Data Science Portfolio',
  description:
    'End-to-end data science on real public data: live API pipelines, honest out-of-time evaluation and interactive dashboards. Drive around the island to see each project.',
  description_es:
    'Ciencia de datos de punta a punta con datos públicos reales: pipelines con APIs en vivo, evaluación fuera de tiempo sin trampa y dashboards interactivos. Recorre la isla para ver cada proyecto.',
  tags: ['Data science', 'Python', 'scikit-learn'],
  tags_es: ['Ciencia de datos', 'Python', 'scikit-learn'],
  title_es: 'Portafolio de ciencia de datos',
  links: [
    { label: 'Portfolio', label_es: 'Portafolio', href: `${DATA_SCIENCE_SITE}/` },
    { label: 'Data science CV', label_es: 'Hoja de vida de ciencia de datos', href: `${DATA_SCIENCE_SITE}/cv/` },
    { label: 'Code', label_es: 'Código', href: 'https://github.com/soushiki/data-science' },
  ],
};

const RAW_DS = [
  {
    id: 'ds-email',
    title_es: 'Prueba A/B de email',
    landmark: 'mailbox',
    title: 'Email Uplift Test',
    description:
      'A/B test readout and uplift modeling on a 64,000-customer randomized experiment, ending in a decision: send everyone the men\'s email ($131 per 1,000, 95% CI $46–$216), and don\'t deploy the targeting model.',
    tags: ['A/B testing', 'Uplift', 'Statistics'],
    description_es:
      "Lectura de una prueba A/B y modelo de uplift sobre un experimento aleatorizado con 64.000 clientes, que termina en una decisión: enviarle a todos el correo para hombres (US$131 por cada 1.000, IC 95 % de US$46 a US$216) y no desplegar el modelo de segmentación.",
    tags_es: ["Pruebas A/B", "Uplift", "Estadística"],
    live: `${DATA_SCIENCE_SITE}/email-uplift/`,
    code: 'https://github.com/soushiki/data-science/tree/main/projects/email-uplift',
  },
  {
    id: 'ds-grid',
    title_es: 'Pronóstico de demanda eléctrica',
    landmark: 'windTurbine',
    title: 'GB Demand Forecast',
    description:
      "Day-ahead electricity demand forecast for Great Britain (4.2% MAPE), compared with the grid operator's official forecasts. It lost on the daily peak, but a 50/50 blend beat the operator by 6.7%.",
    tags: ['Time series', 'Forecasting', 'Weather data'],
    description_es:
      "Pronóstico de demanda eléctrica a un día para Gran Bretaña (MAPE de 4,2 %), comparado con los pronósticos oficiales del operador de la red. Perdió en el pico diario, pero una mezcla 50/50 superó al operador en un 6,7 %.",
    tags_es: ["Series de tiempo", "Pronósticos", "Datos del clima"],
    live: `${DATA_SCIENCE_SITE}/gb-electricity-demand/`,
    code: 'https://github.com/soushiki/data-science/tree/main/projects/gb-electricity-demand',
  },
  {
    id: 'ds-311',
    title_es: 'Retrasos del 311 en NYC',
    landmark: 'streetClock',
    title: 'NYC 311 Delays',
    description:
      'Predicts which NYC service requests will be resolved slower than similar ones, from ~400K records on a live city API. It reframes a misleading 0.95-AUC target into a model with 2.2× lift.',
    tags: ['Classification', 'pandas', 'API data'],
    description_es:
      "Predice qué solicitudes de servicio de NYC se resolverán más lento que otras similares, a partir de ~400 mil registros de una API de la ciudad en vivo. Replantea un engañoso objetivo de 0,95 de AUC y lo convierte en un modelo con lift de 2,2×.",
    tags_es: ["Clasificación", "pandas", "Datos de API"],
    live: `${DATA_SCIENCE_SITE}/nyc-311-delays/`,
    code: 'https://github.com/soushiki/data-science/tree/main/projects/nyc-311-delays',
  },
];

// The contact zone uses the same card, with its own links.
const RAW_CONTACT = {
  id: 'contact',
  title: 'Say hi',
  title_es: 'Saluda',
  description: 'Open to junior frontend and full-stack roles. The quickest way to reach me is LinkedIn.',
  description_es: 'Busco roles junior de frontend y full-stack. La forma más rápida de contactarme es LinkedIn.',
  tags: ['Contact'],
  tags_es: ['Contacto'],
  links: [
    { label: 'LinkedIn', href: CONTACT.linkedin },
    { label: 'GitHub', href: CONTACT.github },
  ],
};

// Localized views (language is fixed at startup). Sister sites get ?lang=es in Spanish.
const view = (item) => {
  const o = localize(item);
  if (o.links) o.links = o.links.map((l) => ({ ...l, href: withLang(l.href) }));
  return o;
};
export const PROJECTS = RAW_PROJECTS.map((p) => ({ ...view(p), caseStudy: withLang(p.caseStudy) }));
export const DATA_SCIENCE_HUB = view(RAW_HUB);
export const DATA_SCIENCE = RAW_DS.map((p) => ({ ...view(p), live: withLang(p.live) }));
export const CONTACT_ZONE = view(RAW_CONTACT);
