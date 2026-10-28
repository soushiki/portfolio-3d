// Content shown on the in-world signs and overlay cards.
export const SIMPLE_PORTFOLIO = 'https://sebherr.netlify.app';

export const CONTACT = {
  github: 'https://github.com/soushiki',
  linkedin: 'https://www.linkedin.com/in/sebastian-herrera-claro-23a0af/',
};

export const PROJECTS = [
  {
    id: 'minoscreto',
    landmark: 'vault',
    title: 'Minoscreto',
    description:
      'Anonymizes Word documents before you paste them into an AI, then restores the real names in the answer. Everything runs in the browser, so nothing leaves your computer.',
    tags: ['React', 'Vite', 'Vitest', '.docx'],
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
    caseStudy: `${SIMPLE_PORTFOLIO}/public/html/formato-medico.html`,
  },
  {
    id: 'davinci',
    landmark: 'bookStack',
    title: 'Da Vinci Diary',
    description: 'Markdown notes app with login and a Firebase database.',
    tags: ['React', 'Next.js', 'Firebase'],
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
    live: 'https://apod-nasa-herrera.netlify.app/',
    code: 'https://github.com/soushiki/nasa-app',
  },
  {
    id: 'gym',
    landmark: 'gym',
    title: 'Gym Routine Generator',
    description: 'Generates a random workout based on your goals. Routine data courtesy of @smoljames.',
    tags: ['React', 'Tailwind CSS'],
    live: 'https://swollymolly.netlify.app/',
    code: 'https://github.com/soushiki/gym-app',
  },
  {
    id: 'todo',
    landmark: 'clipboard',
    title: 'Todo App',
    description: 'CRUD todo list built with React hooks.',
    tags: ['React', 'Vite'],
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
    live: `${SIMPLE_PORTFOLIO}/public/html/cat-gacha.html`,
    code: 'https://github.com/soushiki/portfolio/blob/main/public/html/cat-gacha.html',
  },
  {
    id: 'reddit',
    landmark: 'forumHall',
    title: 'Reddit Plus',
    description: 'Reddit client built on the Reddit API, with state managed in Redux.',
    tags: ['React', 'Redux', 'REST API'],
    code: 'https://github.com/soushiki/reddit-plus',
  },
  {
    id: 'jammming',
    landmark: 'speakers',
    title: 'Jammming',
    description: 'Search Spotify and build playlists using the Spotify Web API.',
    tags: ['React', 'Spotify API', 'OAuth'],
    code: 'https://github.com/soushiki/Jammming',
  },
];

// Data science island: a hub pad on its plaza plus one pad per project.
const DATA_SCIENCE_SITE = 'https://soushiki.github.io/data-science';

export const DATA_SCIENCE_HUB = {
  id: 'ds-hub',
  title: 'Data Science Portfolio',
  description:
    'End-to-end data science on real public data: live API pipelines, honest out-of-time evaluation and interactive dashboards. Drive around the island to see each project.',
  tags: ['Data science', 'Python', 'scikit-learn'],
  links: [
    { label: 'Portfolio', href: `${DATA_SCIENCE_SITE}/` },
    { label: 'Data science CV', href: `${DATA_SCIENCE_SITE}/cv/` },
    { label: 'Code', href: 'https://github.com/soushiki/data-science' },
  ],
};

export const DATA_SCIENCE = [
  {
    id: 'ds-email',
    landmark: 'mailbox',
    title: 'Email Uplift Test',
    description:
      'A/B test readout and uplift modeling on a 64,000-customer randomized experiment, ending in a decision: send everyone the men\'s email ($131 per 1,000, 95% CI $46–$216), and don\'t deploy the targeting model.',
    tags: ['A/B testing', 'Uplift', 'Statistics'],
    live: `${DATA_SCIENCE_SITE}/email-uplift/`,
    code: 'https://github.com/soushiki/data-science/tree/main/projects/email-uplift',
  },
  {
    id: 'ds-grid',
    landmark: 'windTurbine',
    title: 'GB Demand Forecast',
    description:
      "Day-ahead electricity demand forecast for Great Britain (4.2% MAPE), compared with the grid operator's official forecasts. It lost on the daily peak, but a 50/50 blend beat the operator by 6.7%.",
    tags: ['Time series', 'Forecasting', 'Weather data'],
    live: `${DATA_SCIENCE_SITE}/gb-electricity-demand/`,
    code: 'https://github.com/soushiki/data-science/tree/main/projects/gb-electricity-demand',
  },
  {
    id: 'ds-311',
    landmark: 'streetClock',
    title: 'NYC 311 Delays',
    description:
      'Predicts which NYC service requests will be resolved slower than similar ones, from ~400K records on a live city API. It reframes a misleading 0.95-AUC target into a model with 2.2× lift.',
    tags: ['Classification', 'pandas', 'API data'],
    live: `${DATA_SCIENCE_SITE}/nyc-311-delays/`,
    code: 'https://github.com/soushiki/data-science/tree/main/projects/nyc-311-delays',
  },
];

// The contact zone uses the same card, with its own links.
export const CONTACT_ZONE = {
  id: 'contact',
  title: 'Say hi',
  description: 'Open to junior frontend and full-stack roles. The quickest way to reach me is LinkedIn.',
  tags: ['Contact'],
  links: [
    { label: 'LinkedIn', href: CONTACT.linkedin },
    { label: 'GitHub', href: CONTACT.github },
  ],
};
