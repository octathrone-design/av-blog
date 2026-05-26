const WP_API_BASE = process.env.WP_API_URL || "https://blog.avdesignintl.com/wp-json/wp/v2";
const WP_IMAGE_BASE = process.env.WP_IMAGE_URL || "https://blog.avdesignintl.com";

// Image proxy: /api/image-proxy?path=...
const PROXY_ENABLED = process.env.IMAGE_PROXY === "true" || false;
const PROXY_BASE = process.env.IMAGE_PROXY_BASE || "/api/image-proxy";

/* ── Types ──────────────────────────────────────────── */

interface WPPost {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string } | string;
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

/** Extract the uploads-relative path from a WordPress image URL */
function getUploadsPath(imageUrl: string): string | null {
  // Match wp-content/uploads/... path from any WordPress URL
  const match = imageUrl.match(/\/wp-content\/uploads\/(.+)/);
  if (!match) {
    // Handle the case where source_url is relative to wp-api or similar
    const altMatch = imageUrl.match(/uploads\/(.+)/);
    return altMatch ? `uploads/${altMatch[1]}` : null;
  }
  return `wp-content/uploads/${match[1]}`;
}

function proxyImageUrl(url: string): string {
  if (!PROXY_ENABLED || !url) return url;
  const uploadsPath = getUploadsPath(url);
  if (!uploadsPath) return url;
  return `${PROXY_BASE}?path=${encodeURIComponent(uploadsPath)}`;
}

export function extractFeaturedImage(post: WPPost): { url: string; alt: string; width: number; height: number } | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  let url = media.media_details?.sizes?.medium_large?.source_url || media.source_url;
  // Ensure image URL uses the correct base (replace if needed)
  if (url && WP_IMAGE_BASE) {
    try {
      const urlObj = new URL(url);
      const imgBase = new URL(WP_IMAGE_BASE);
      if (urlObj.hostname !== imgBase.hostname && imgBase.hostname !== "blog.avdesignintl.com") {
        // Only rewrite if the image base is not the standard blog domain
        url = url.replace(urlObj.origin, WP_IMAGE_BASE);
      }
    } catch {}
  }
  // Proxy through our API route
  url = proxyImageUrl(url);
  const width = media.media_details?.sizes?.medium_large?.width || 768;
  const height = media.media_details?.sizes?.medium_large?.height || 512;
  return { url, alt: media.alt_text || post.title.rendered, width, height };
}

export function extractCategories(post: WPPost): Array<{ id: number; name: string; slug: string }> {
  return post._embedded?.["wp:term"]?.[0] || [];
}

export function getExcerpt(post: WPPost): string {
  if (typeof post.excerpt === "string") return post.excerpt;
  return post.excerpt?.rendered || "";
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Rewrites inline images in post content so they go through the image proxy.
 */
export function rewriteContentImages(html: string): string {
  if (!PROXY_ENABLED || !html) return html;
  // Replace img src attributes pointing to blog.avdesignintl.com/wp-content/uploads/
  return html.replace(
    /(<img[^>]*src=")(https?:\/\/[^"']*\/wp-content\/uploads\/([^"]+))("[^>]*>)/g,
    (match, before, _url, uploadPath, after) => {
      const proxyUrl = `/api/image-proxy?path=${encodeURIComponent(`wp-content/uploads/${uploadPath}`)}`;
      return `${before}${proxyUrl}${after}`;
    }
  );
}  
