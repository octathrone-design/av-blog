const WP_API_BASE = process.env.WP_API_URL || "https://blog.avdesignintl.com/wp-json/wp/v2";

/* ── Types ──────────────────────────────────────────── */

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  modified: string;
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: Record<string, { source_url: string; width: number; height: number }>;
      };
    }>;
    "wp:term"?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

/* ── API helper ─────────────────────────────────────── */

async function fetchAPI<T>(endpoint: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${WP_API_BASE}${endpoint}`, {
    next: { revalidate },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`WordPress API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/* ── Public functions ───────────────────────────────── */

export async function getPosts(page = 1, perPage = 12, categorySlug?: string): Promise<WPPost[]> {
  const params = new URLSearchParams({
    _embed: "wp:featuredmedia,wp:term",
    per_page: String(perPage),
    page: String(page),
    status: "publish",
    orderby: "date",
    order: "desc",
  });

  if (categorySlug) {
    const categories = await getCategories();
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) params.set("categories", String(cat.id));
  }

  return fetchAPI<WPPost[]>(`/posts?${params}`, 60);
}

export async function getPost(slug: string): Promise<WPPost | null> {
  const posts = await fetchAPI<WPPost[]>(`/posts?_embed=wp:featuredmedia,wp:term&slug=${slug}`, 3600);
  return posts.length > 0 ? posts[0] : null;
}

export async function getCategories(): Promise<WPCategory[]> {
  return fetchAPI<WPCategory[]>("/categories?per_page=100&hide_empty=true", 300);
}

export async function getRecentPosts(limit = 3): Promise<WPPost[]> {
  return fetchAPI<WPPost[]>(`/posts?_embed=wp:featuredmedia,wp:term&per_page=${limit}&orderby=date&order=desc`, 60);
}

/* ── Helpers ────────────────────────────────────────── */

export function extractFeaturedImage(post: WPPost): { url: string; alt: string; width: number; height: number } | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  const url = media.media_details?.sizes?.medium_large?.source_url || media.source_url;
  const width = media.media_details?.sizes?.medium_large?.width || 768;
  const height = media.media_details?.sizes?.medium_large?.height || 512;
  return { url, alt: media.alt_text || post.title.rendered, width, height };
}

export function extractCategories(post: WPPost): Array<{ id: number; name: string; slug: string }> {
  return post._embedded?.["wp:term"]?.[0] || [];
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
