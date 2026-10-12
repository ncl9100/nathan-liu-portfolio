// Facts about Nathan: profile, projects, and experience.
// Single source of truth. LiuOS reads this now; the nav pages will read it too.
// LiuOS-specific wording and settings stay in LIUOS_CONFIG in index.html.

export const profile = {
  "name": "Nathan Liu",
  "bio": "Junior at NYU studying Computer Science and Data Science. I build ML tools and interactive things, and I'm a data science intern at NYU's Leslie eLab.",
  "email": "ncl9100@nyu.edu",
  "linkedin": "https://www.linkedin.com/in/nathan-ncl-liu",
  "github": "https://github.com/ncl9100",
  "education": "NYU · Computer Science and Data Science",
  "about": [
    "Hi, I'm Nathan. I'm a junior at NYU pursuing a Bachelor of Arts in Computer Science and Data Science, and I'm working toward a career in ML engineering and data science.",
    "Right now I'm a data science intern at the Leslie eLab, NYU's startup hub, where I work on data and AI tooling. Recently my team took 2nd place at the NYU Stern Sustainability Hackathon with HotTakes, a project that reuses data center waste heat to supply hot water to nearby residents.",
    "Outside of building, I tutor math and computer science (150+ hours and a 5.0 rating on Wyzant), and I co-founded Seeds of Change, an English program that served 100+ students in rural Taiwan. I've also played violin for over 12 years.",
    "I grew up in the Bay Area and now live in New York. This room is my attempt to make a portfolio feel like a place you can actually walk into."
  ],
  "aboutProjectLink": {
    "text": "HotTakes",
    "project": "hottakes"
  }
};

// Projects, newest first. The Projects page shows them in this order; keep it newest first.
// "image" is a path in assets/projects/. A "Live demo" or "Live site" link is what clicking the card opens.
export const projects = [
  {
    "id": "hottakes",
    "title": "HotTakes",
    "badge": "2nd Place, NYU Stern Sustainability Hackathon",
    "date": "Oct. 2026",
    "summary": "Reusing waste heat from data centers to supply hot water to nearby residents. Built for the Grundfos Waste Heat Reuse Challenge.",
    "description": "A heat-demand forecasting model, outage reserve simulation, and Streamlit dashboard with a Claude assistant that calls read-only model tools. Forecasts were calibrated to Con Ed filings and validated on real metered building steam data.",
    "role": "Found the comparable-building demand dataset, built the ML demand model, the simulation, the Streamlit app, and a Claude-powered assistant. Presented the model in the final pitch. Team of three.",
    "tech": [
      "Python",
      "scikit-learn",
      "Streamlit",
      "Claude API"
    ],
    "image": "assets/projects/hottakes.png",
    "imageTodo": "TODO · HotTakes project image",
    "links": [
      {
        "label": "GitHub",
        "url": "https://github.com/ncl9100/hot-takes"
      },
      {
        "label": "Live demo",
        "url": "https://hot-takes.streamlit.app"
      }
    ]
  },
  {
    "id": "website",
    "aliases": [
      "room-portfolio"
    ],
    "title": "Personal Room / LiuOS",
    "date": "Oct. 2026",
    "summary": "A 3D model of my room built with three.js, with a custom in-browser OS for my work.",
    "description": "An interactive room with camera navigation, discoverable objects, and a custom desktop for exploring my portfolio.",
    "role": "Designed and built it.",
    "tech": [
      "three.js",
      "JavaScript",
      "HTML/CSS"
    ],
    "image": "assets/projects/personal-room.png",
    "imageTodo": "TODO · Website project image",
    "links": [
      {
        "label": "GitHub",
        "url": "https://github.com/ncl9100/nathan-liu-portfolio"
      },
      {
        "label": "Live site",
        "url": "/"
      }
    ]
  },
  {
    "id": "marginguard",
    "title": "MarginGuard",
    "date": "Apr. 2026",
    "summary": "ML project with agentic AI, built at the NYU Data Science Club datathon.",
    "description": "A Python/SQL pipeline in DuckDB joins labor logs and billing records into project-level signals. Margin metrics and erosion thresholds help an AI agent rank projects by financial exposure.",
    "role": "TODO · Confirm your individual MarginGuard role and contributions",
    "tech": [
      "Python",
      "SQL",
      "DuckDB",
      "Claude API",
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Vercel"
    ],
    "image": "assets/projects/marginguard.png",
    "imageTodo": "TODO · MarginGuard project image",
    "links": [
      {
        "label": "GitHub",
        "url": "https://github.com/ncl9100/pulse-ai-datathon-v2"
      },
      {
        "label": "Live demo",
        "url": "https://pulse-ai-datathon-v2-o7s9.vercel.app"
      }
    ]
  }
];

export const experience = [
  {
    "organization": "Leslie eLab, NYU Entrepreneurial Institute",
    "role": "Data Science Intern",
    "dates": "Nov. 2025 – Present",
    "summary": "Data and AI tooling for NYU's startup hub.",
    "bullets": [
      "Auditing the internal AI agent registry and mapping gaps in its data ontology.",
      "Leading CRM deduplication and building a gold set to QA duplicate-detection signals, with human-in-the-loop review. CRM data hygiene in Attio and an interoperability memo.",
      "Built an LLM-assisted pipeline using Perplexity and Google Search APIs to classify startup records by NYU school.",
      "Shipped features to a BigQuery-backed React analytics dashboard and audited production data pipelines against documentation. Earlier work included WCAG 2.1 AA accessibility and engineering tooling."
    ],
    "tech": [
      "Python",
      "SQL",
      "BigQuery",
      "React",
      "Attio",
      "Perplexity API",
      "Google Search APIs"
    ]
  },
  {
    "organization": "Amazon China",
    "role": "Full-Stack AI Developer",
    "dates": "June 2025 – Aug. 2025",
    "summary": "Built an AI crypto trading assistant.",
    "bullets": [
      "Trained a scikit-learn regression model on rolling prices for short-term forecasting in a Flask and React trading assistant.",
      "Built a signal engine combining TextBlob headline sentiment with price changes to classify assets as buy, sell, or hold.",
    "Scraped Reddit headlines as an input signal.",
      "Validated sentiment classification against manually labeled headlines in Jupyter and wrote pytest and Jest tests."
    ],
    "tech": [
      "React",
      "Flask",
      "Python",
      "scikit-learn",
      "TextBlob",
      "Jupyter",
      "pytest",
      "Jest"
    ]
  }
];

// Room.js imports this for the kitchen-counter photo pile. Empty on main until that
// feature ships; a missing export crashes the whole 3D room on load.
export const photos = [];
