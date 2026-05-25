export type Locale = 'en' | 'es'
export const LOCALES: Locale[] = ['en', 'es']
export const DEFAULT_LOCALE: Locale = 'es'

const en = {
  nav: {
    projects: 'Projects',
  },
  home: {
    subtitle: 'Backend Engineer · NestJS · PostgreSQL · TypeScript',
    projects: 'Projects',
    caseStudy: 'Case Study',
    liveDashboard: 'Live Dashboard →',
  },
  project: {
    mlScraper: {
      description:
        'Weekly data pipeline that snapshots top-selling products across 8 MercadoLibre markets. Covers category sync via official API, web scraping with Decodo, resumable sync runs, and a PostgreSQL schema designed for time-series price analysis.',
    },
  },
  caseStudy: {
    back: '← Back to projects',
    type: 'Data Pipeline',
    intro:
      'A weekly automated pipeline that collects top-selling product data from 8 MercadoLibre markets (Argentina, Brazil, Chile, Mexico, Colombia, Peru, Uruguay, Venezuela). Data is stored as immutable snapshots in PostgreSQL, enabling price trend and ranking analysis over time.',
    liveDashboard: 'Live Dashboard →',
    github: 'GitHub',
    sections: {
      stack: 'Tech Stack',
      architecture: 'System Architecture',
      architectureIntro:
        'The pipeline runs in three phases triggered by a GitHub Actions weekly cron (Monday 03:00 UTC). Each phase is independently recoverable — a failure in one category does not abort the rest.',
      database: 'Database Design',
      databaseIntro1: 'The schema is built around two core decisions: a',
      databaseHighlight1: 'two-level category tree',
      databaseMiddle: '(root → leaf) and',
      databaseHighlight2: 'immutable product snapshots',
      databaseIntro2:
        '. Products are never updated — every sync inserts new rows. This makes price and ranking history a simple',
      databaseIntro3: 'query.',
      indexing: 'Index Strategy',
      indexingIntro:
        'The products table grows by ~20 rows per category per sync. With 251 parent categories across 8 sites running weekly, a full year produces ~680,000 rows. Proper composite indexes are what keep dashboard queries under 50 ms at that scale.',
      indexingNote1: 'Rule of thumb applied: index columns in',
      indexingNote2: 'equality-first, range-last',
      indexingNote3:
        'order within each composite. A query on',
      indexingNote4: 'cannot use an index ordered as',
      indexingNote5: 'for the equality predicates.',
      pagination: 'Pagination Strategy',
      paginationIntro1: 'The',
      paginationIntro2:
        'endpoint uses',
      paginationHighlight: 'offset pagination',
      paginationIntro3: '. Each response includes a',
      paginationIntro4:
        'envelope so the client can render pagination controls without a second request.',
      paginationNote:
        'Offset pagination is used here because the dataset is read-only (snapshots never change order after insert) and the UI needs random page access. Cursor pagination would be preferable for infinite scroll or real-time feeds where rows are inserted between pages.',
      resilience: 'Resilience & Observability',
    },
    stack: [
      { label: 'NestJS', role: 'API & orchestration' },
      { label: 'TypeScript', role: 'Language' },
      { label: 'PostgreSQL', role: 'Database (Neon)' },
      { label: 'Prisma 7', role: 'ORM + migrations' },
      { label: 'GitHub Actions', role: 'Weekly cron trigger' },
      { label: 'Decodo', role: 'Web scraping API' },
    ],
    indexes: [
      {
        name: 'products_country_category_id_snapshot_date_idx',
        columns: '(country, category_id, snapshot_date)',
        reason:
          'Main dashboard query: filter by site + category within a date range. The composite covers all three predicates without a table scan. Without it, PostgreSQL falls back to the single-column snapshot_date index and re-filters in memory.',
      },
      {
        name: 'products_catalog_id_snapshot_date_idx',
        columns: '(catalog_id, snapshot_date)',
        reason:
          'Price history chart query: fetch all snapshots for a given product ordered by date. The leading column eliminates all other products; snapshot_date gives the ordering for free.',
      },
      {
        name: 'products_country_snapshot_date_idx',
        columns: '(country, snapshot_date)',
        reason:
          'Stats aggregation: COUNT(*) or GROUP BY per site for a recent date range. Covers the WHERE clause without touching enrichment columns.',
      },
      {
        name: 'categories_ml_id_idx',
        columns: '(ml_id)',
        reason:
          'Category upsert during sync: ON CONFLICT (ml_id) requires a unique index. Also covers category resolution lookups when inserting leaf categories.',
      },
    ],
    resilience: {
      resumable: {
        title: 'Resumable syncs',
        body: 'a sync_progress table tracks per-category state (pending → in_progress → done | failed). A circuit breaker abort can be resumed mid-run via POST /sync/resume/:siteId.',
      },
      circuitBreaker: {
        title: 'Circuit breaker',
        body: 'after 10 consecutive scraper hard failures, the breaker trips, dumps diagnostics to disk, and surfaces a structured aborted payload (completed categories, pending categories, diagnostics path).',
      },
      concurrency: {
        title: 'Global concurrency cap',
        body: 'a process-wide p-limit semaphore caps parallel Decodo requests at SCRAPER_MAX_CONCURRENT (default 10), preventing accidental plan overruns.',
      },
    },
    footer: {
      allProjects: '← All projects',
      explore: 'Explore the dashboard →',
    },
  },
  dashboard: {
    back: '← Case Study',
    title: 'ML Market Dashboard',
    subtitle: 'Top-selling products across MercadoLibre markets · click any row for price history',
    dbError: {
      title: 'Database not reachable',
      body: 'Set DATABASE_URL in .env.local with the Neon connection string.',
    },
  },
  stats: {
    totalProducts: 'Total Products',
    allSnapshots: 'all snapshots',
    categories: 'Categories',
    sellers: 'Sellers',
    lastSync: 'Last Sync',
    topSite: 'top site',
  },
  filters: {
    site: 'Site',
    category: 'Category',
    from: 'From',
    to: 'To',
    search: 'Search',
    searchPlaceholder: 'Product name...',
    allSites: 'All sites',
    allCategories: 'All categories',
    apply: 'Apply',
    loading: 'Loading…',
  },
  table: {
    product: 'Product',
    category: 'Category',
    price: 'Price',
    sold: 'Sold',
    rating: 'Rating',
    site: 'Site',
    snapshot: 'Snapshot',
    noProducts: 'No products found. Try adjusting the filters.',
    showing: 'Showing',
    of: 'of',
    results: 'results',
  },
  chart: {
    snapshots: 'snapshots',
    onlyOne: 'Only 1 snapshot available — history requires at least 2 sync runs.',
    price: 'Price',
  },
  common: {
    loadingProducts: 'Loading products…',
    loadingHistory: 'Loading price history…',
    apiError: 'Could not load products.',
    sql: 'SQL',
    offsetPagination: 'This table uses offset pagination:',
    filteredBy: 'filtered by',
    coveredBy: 'covered by',
  },
}

const es: typeof en = {
  nav: {
    projects: 'Proyectos',
  },
  home: {
    subtitle: 'Backend Engineer · NestJS · PostgreSQL · TypeScript',
    projects: 'Proyectos',
    caseStudy: 'Caso de Estudio',
    liveDashboard: 'Dashboard en Vivo →',
  },
  project: {
    mlScraper: {
      description:
        'Pipeline de datos semanal que registra los productos más vendidos en 8 mercados de MercadoLibre. Incluye sincronización de categorías vía API oficial, scraping con Decodo, ejecuciones reanudables y un esquema PostgreSQL diseñado para análisis de precios en el tiempo.',
    },
  },
  caseStudy: {
    back: '← Volver a proyectos',
    type: 'Pipeline de Datos',
    intro:
      'Pipeline automatizado semanal que recopila datos de los productos más vendidos en 8 mercados de MercadoLibre (Argentina, Brasil, Chile, México, Colombia, Perú, Uruguay, Venezuela). Los datos se almacenan como snapshots inmutables en PostgreSQL, permitiendo análisis de tendencias de precios y rankings a lo largo del tiempo.',
    liveDashboard: 'Dashboard en Vivo →',
    github: 'GitHub',
    sections: {
      stack: 'Stack Tecnológico',
      architecture: 'Arquitectura del Sistema',
      architectureIntro:
        'El pipeline se ejecuta en tres fases disparadas por un cron semanal de GitHub Actions (lunes 03:00 UTC). Cada fase es recuperable de forma independiente — un fallo en una categoría no cancela el resto.',
      database: 'Diseño de Base de Datos',
      databaseIntro1: 'El esquema se basa en dos decisiones clave: un',
      databaseHighlight1: 'árbol de categorías de dos niveles',
      databaseMiddle: '(raíz → hoja) y',
      databaseHighlight2: 'snapshots inmutables de productos',
      databaseIntro2:
        '. Los productos nunca se actualizan — cada sincronización inserta nuevas filas. Esto convierte el historial de precios y rankings en una simple consulta',
      databaseIntro3: '.',
      indexing: 'Estrategia de Índices',
      indexingIntro:
        'La tabla de productos crece ~20 filas por categoría por sincronización. Con 251 categorías padre en 8 sitios ejecutándose semanalmente, un año completo produce ~680,000 filas. Los índices compuestos adecuados son lo que mantiene las consultas del dashboard por debajo de 50 ms a esa escala.',
      indexingNote1: 'Regla aplicada: indexar columnas en orden',
      indexingNote2: 'igualdad-primero, rango-último',
      indexingNote3: 'dentro de cada compuesto. Una consulta sobre',
      indexingNote4: 'no puede usar un índice ordenado como',
      indexingNote5: 'para los predicados de igualdad.',
      pagination: 'Estrategia de Paginación',
      paginationIntro1: 'El endpoint',
      paginationIntro2: 'usa',
      paginationHighlight: 'paginación por offset',
      paginationIntro3: '. Cada respuesta incluye un envelope',
      paginationIntro4:
        'para que el cliente renderice los controles de paginación sin una segunda petición.',
      paginationNote:
        'Se usa paginación por offset porque el dataset es de solo lectura (los snapshots nunca cambian de orden tras ser insertados) y la UI necesita acceso aleatorio a páginas. La paginación por cursor sería preferible para scroll infinito o feeds en tiempo real donde se insertan filas entre páginas.',
      resilience: 'Resiliencia y Observabilidad',
    },
    stack: [
      { label: 'NestJS', role: 'API y orquestación' },
      { label: 'TypeScript', role: 'Lenguaje' },
      { label: 'PostgreSQL', role: 'Base de datos (Neon)' },
      { label: 'Prisma 7', role: 'ORM + migraciones' },
      { label: 'GitHub Actions', role: 'Cron semanal' },
      { label: 'Decodo', role: 'API de web scraping' },
    ],
    indexes: [
      {
        name: 'products_country_category_id_snapshot_date_idx',
        columns: '(country, category_id, snapshot_date)',
        reason:
          'Consulta principal del dashboard: filtrar por sitio + categoría en un rango de fechas. El compuesto cubre los tres predicados sin escaneo completo. Sin él, PostgreSQL recurre al índice simple de snapshot_date y re-filtra en memoria.',
      },
      {
        name: 'products_catalog_id_snapshot_date_idx',
        columns: '(catalog_id, snapshot_date)',
        reason:
          'Consulta del gráfico de historial: obtener todos los snapshots de un producto ordenados por fecha. La columna principal elimina el resto de productos; snapshot_date da el ordenamiento de forma gratuita.',
      },
      {
        name: 'products_country_snapshot_date_idx',
        columns: '(country, snapshot_date)',
        reason:
          'Agregación de estadísticas: COUNT(*) o GROUP BY por sitio en un rango de fechas reciente. Cubre la cláusula WHERE sin tocar columnas de enriquecimiento.',
      },
      {
        name: 'categories_ml_id_idx',
        columns: '(ml_id)',
        reason:
          'Upsert de categorías durante la sincronización: ON CONFLICT (ml_id) requiere un índice único. También cubre búsquedas de resolución de categorías al insertar categorías hoja.',
      },
    ],
    resilience: {
      resumable: {
        title: 'Sincronizaciones reanudables',
        body: 'una tabla sync_progress rastrea el estado por categoría (pending → in_progress → done | failed). Una interrupción por circuit breaker puede reanudarse a mitad de ejecución vía POST /sync/resume/:siteId.',
      },
      circuitBreaker: {
        title: 'Circuit breaker',
        body: 'tras 10 fallos consecutivos del scraper, el breaker se activa, guarda diagnósticos en disco y devuelve un payload estructurado aborted (categorías completadas, pendientes y ruta de diagnósticos).',
      },
      concurrency: {
        title: 'Límite global de concurrencia',
        body: 'un semáforo p-limit a nivel de proceso limita las peticiones paralelas a Decodo en SCRAPER_MAX_CONCURRENT (por defecto 10), evitando sobrepasar el plan accidentalmente.',
      },
    },
    footer: {
      allProjects: '← Todos los proyectos',
      explore: 'Explorar el dashboard →',
    },
  },
  dashboard: {
    back: '← Caso de Estudio',
    title: 'Dashboard ML Market',
    subtitle:
      'Productos más vendidos en mercados de MercadoLibre · clic en una fila para ver historial de precios',
    dbError: {
      title: 'Base de datos no disponible',
      body: 'Configurá DATABASE_URL en .env.local con el connection string de Neon.',
    },
  },
  stats: {
    totalProducts: 'Total Productos',
    allSnapshots: 'todos los snapshots',
    categories: 'Categorías',
    sellers: 'Vendedores',
    lastSync: 'Último Sync',
    topSite: 'sitio top',
  },
  filters: {
    site: 'Sitio',
    category: 'Categoría',
    from: 'Desde',
    to: 'Hasta',
    search: 'Buscar',
    searchPlaceholder: 'Nombre del producto...',
    allSites: 'Todos los sitios',
    allCategories: 'Todas las categorías',
    apply: 'Aplicar',
    loading: 'Cargando…',
  },
  table: {
    product: 'Producto',
    category: 'Categoría',
    price: 'Precio',
    sold: 'Vendidos',
    rating: 'Calificación',
    site: 'Sitio',
    snapshot: 'Snapshot',
    noProducts: 'No se encontraron productos. Ajustá los filtros.',
    showing: 'Mostrando',
    of: 'de',
    results: 'resultados',
  },
  chart: {
    snapshots: 'snapshots',
    onlyOne: 'Solo 1 snapshot disponible — el historial requiere al menos 2 sincronizaciones.',
    price: 'Precio',
  },
  common: {
    loadingProducts: 'Cargando productos…',
    loadingHistory: 'Cargando historial de precios…',
    apiError: 'No se pudieron cargar los productos.',
    sql: 'SQL',
    offsetPagination: 'Esta tabla usa paginación por offset:',
    filteredBy: 'filtrado por',
    coveredBy: 'cubierto por',
  },
}

const translations = { en, es }

export function t(locale: Locale) {
  return translations[locale]
}
