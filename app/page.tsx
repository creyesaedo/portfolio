import Link from 'next/link'

const projects = [
  {
    id: 'ml-scraper',
    title: 'ML Market Scraper',
    description:
      'Weekly data pipeline that snapshots top-selling products across 8 MercadoLibre markets. Covers category sync via official API, web scraping with Decodo, resumable sync runs, and a PostgreSQL schema designed for time-series price analysis.',
    tags: ['NestJS', 'TypeScript', 'PostgreSQL', 'Prisma', 'GitHub Actions', 'Neon'],
    caseStudy: '/projects/ml-scraper',
    dashboard: '/projects/ml-scraper/dashboard',
    status: 'production',
  },
]

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <section className="mb-20">
        <h1 className="text-4xl font-bold mb-3 text-white">Cristian Reyes</h1>
        <p className="text-lg text-zinc-400">Backend Engineer · NestJS · PostgreSQL · TypeScript</p>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-8">
          Projects
        </h2>
        <div className="space-y-5">
          {projects.map((project) => (
            <article
              key={project.id}
              className="border border-zinc-800 rounded-xl p-6 bg-zinc-900/40 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  {project.status}
                </span>
              </div>

              <p className="text-zinc-400 text-sm mb-4 leading-relaxed">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-3">
                <Link
                  href={project.caseStudy}
                  className="text-sm px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
                >
                  Case Study
                </Link>
                <Link
                  href={project.dashboard}
                  className="text-sm px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  Live Dashboard →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
