// Content shown on the in-world signs and overlay cards.
export const SIMPLE_PORTFOLIO = 'https://sebherr.netlify.app';

export const CONTACT = {
  github: 'https://github.com/soushiki',
  linkedin: 'https://www.linkedin.com/in/sebastian-herrera-claro-23a0af/',
};

export const PROJECTS = [
  {
    id: 'minoscreto',
    title: 'Minoscreto',
    description:
      'Anonymizes Word documents before you paste them into an AI, then restores the real names in the answer. Everything runs in the browser, so nothing leaves your computer.',
    tags: ['React', 'Vite', 'Vitest', '.docx'],
    live: 'https://minoscreto.netlify.app/',
    code: 'https://github.com/soushiki/minoscreto',
  },
  {
    id: 'brasa',
    title: 'Brasa Food & Drinks',
    description:
      'Landing page prototype for a Cartagena restaurant: smash burgers, wood-fired pizza and ribs, with menu, locations and ordering sections.',
    tags: ['HTML', 'CSS', 'Responsive'],
    live: 'https://protorest.netlify.app/',
    code: 'https://github.com/soushiki/restaurant-prototype',
  },
  {
    id: 'ingresos',
    title: 'Ingresos App',
    description:
      "Reads photos and PDFs of receipts and POS cash-closing reports with OCR and a local vision model, then builds the day's accounting ledger and exports it to Excel.",
    tags: ['Python', 'OCR', 'Ollama', 'Excel'],
    code: 'https://github.com/soushiki/ingresos-app',
  },
  {
    id: 'stockroom',
    title: 'Stockroom',
    description:
      'Full-stack accounting and inventory prototype, with a Spring Boot REST API, an Angular frontend and Docker Compose for local setup.',
    tags: ['Java', 'Spring Boot', 'Angular', 'Docker'],
    code: 'https://github.com/soushiki/stockroom',
  },
  {
    id: 'davinci',
    title: 'Da Vinci Diary',
    description: 'Markdown notes app with login and a Firebase database.',
    tags: ['React', 'Next.js', 'Firebase'],
    live: 'https://davincidiary.netlify.app/',
    code: 'https://github.com/soushiki/notes-app',
  },
  {
    id: 'apod',
    title: 'NASA APOD',
    description:
      "Shows NASA's Astronomy Picture of the Day from the APOD API, with responses cached in local storage.",
    tags: ['React', 'Vite', 'REST API'],
    live: 'https://apod-nasa-herrera.netlify.app/',
    code: 'https://github.com/soushiki/nasa-app',
  },
  {
    id: 'gym',
    title: 'Gym Routine Generator',
    description: 'Generates a random workout based on your goals. Routine data courtesy of @smoljames.',
    tags: ['React', 'Tailwind CSS'],
    live: 'https://swollymolly.netlify.app/',
    code: 'https://github.com/soushiki/gym-app',
  },
  {
    id: 'todo',
    title: 'Todo App',
    description: 'CRUD todo list built with React hooks.',
    tags: ['React', 'Vite'],
    live: 'https://bruh-todo-app.netlify.app/',
    code: 'https://github.com/soushiki/todo-list',
  },
  {
    id: 'reddit',
    title: 'Reddit Plus',
    description: 'Reddit client built on the Reddit API, with state managed in Redux.',
    tags: ['React', 'Redux', 'REST API'],
    code: 'https://github.com/soushiki/reddit-plus',
  },
  {
    id: 'jammming',
    title: 'Jammming',
    description: 'Search Spotify and build playlists using the Spotify Web API.',
    tags: ['React', 'Spotify API', 'OAuth'],
    code: 'https://github.com/soushiki/Jammming',
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
