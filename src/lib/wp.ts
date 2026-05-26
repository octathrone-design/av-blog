const WP_API_BASE = process.env.WP_API_URL || "https://wp-api.avdesignintl.com/wp-json/wp/v2";

// Map of known WordPress media slugs to local image paths
// These SVG files live in public/images/blog/ and are served directly from Netlify CDN
const LOCAL_IMAGE_MAP: Record<string, string> = {
  "featured-image-1779358726": "/images/blog/featured-image-1779358726.svg",
  "featured-image-1779358658": "/images/blog/featured-image-1779358658.svg",
  "avd-logo": "/images/blog/avd-logo.svg",
  "black-color-logo": "/images/blog/black-color-logo.svg",
  "woocommerce-placeholder": "/images/blog/woocommerce-placeholder.svg",
};

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
      slug?: string;
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

/**
 * Resolve a WordPress media slug to a local image path.
 * Falls back to the original URL if no local mapping exists.
 */
function resolveLocalImage(sourceUrl: string, mediaSlug?: string): string {
  if (mediaSlug && LOCAL_IMAGE_MAP[mediaSlug]) {
    return LOCAL_IMAGE_MAP[mediaSlug];
  }
  // Try to extract slug from URL
  const match = sourceUrl.match(/([^/]+?)(?:-\d+x\d+)?\.\w+$/);
  if (match) {
    const baseName = match[1].replace(/-\d+x\d+$/, "");
    if (LOCAL_IMAGE_MAP[baseName]) {
      return LOCAL_IMAGE_MAP[baseName];
    }
  }
  return sourceUrl;
}

export function extractFeaturedImage(post: WPPost): { url: string; alt: string; width: number; height: number } | null {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media) return null;
  
  const url = resolveLocalImage(media.source_url, media.slug || media.source_url.match(/([^/]+?)(?:-\d+x\d+)?\.\w+$/)?.[1]);
  const alt = media.alt_text || post.title.rendered;
  const width = media.media_details?.sizes?.medium_large?.width || 768;
  const height = media.media_details?.sizes?.medium_large?.height || 512;
  return { url, alt, width, height };
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
 * Rewrites inline images in post content so they use local SVG assets instead of
 * broken WordPress upload URLs.
 */
export function rewriteContentImages(html: string): string {
  if (!html) return html;
  // Map inline WordPress image URLs to local SVGs
  return html.replace(
    /<img[^>]+src="https?:\/\/[^"']*\/wp-content\/uploads\/([^"]+)"([^>]*)>/g,
    (_match, uploadPath, rest) => {
      // Extract the filename without size suffix (e.g. featured-image-1779358726-300x224 -> featured-image-1779358726)
      const baseMatch = uploadPath.match(/([^/]+?)(?:-\d+x\d+)?\.\w+$/);
      if (baseMatch) {
        const baseName = baseMatch[1];
        const localPath = LOCAL_IMAGE_MAP[baseName];
        if (localPath) {
          return `<img src="${localPath}"${rest}>`;
        }
      }
      // If no local match, use a placeholder
      return `<img src="/images/blog/featured-image-1779358726.svg" alt="Image" loading="lazy">`;
    }
  );
}
