import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // Netlify edge doesn't support fetch with custom Host header

const WP_SERVER = process.env.WP_SERVER || "77.37.37.72";
const WP_HOST_HEADER = process.env.WP_HOST_HEADER || "www.avdesignintl.com";
const WP_BLOG_PATH = process.env.WP_BLOG_PATH || "/blog";

/**
 * Proxies images from the WordPress server (which is firewalled from direct HTTP access).
 * Fetches via server IP with the correct Host header so Hostinger serves the blog's files.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("path");

  if (!imagePath) {
    return new NextResponse("Missing path parameter", { status: 400 });
  }

  // Prevent directory traversal
  const sanitized = imagePath.replace(/\.\./g, "").replace(/^\/+/, "");
  if (!sanitized) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  try {
    const upstreamUrl = `http://${WP_SERVER}${WP_BLOG_PATH}/${sanitized}`;

    const response = await fetch(upstreamUrl, {
      headers: {
        Host: WP_HOST_HEADER,
        "User-Agent": "Mozilla/5.0 (compatible; AVBlog/1.0)",
      },
      // Netlify serverless functions have a 10s timeout — be generous
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Image proxy: upstream ${response.status} for ${imagePath}`);
      return new NextResponse(null, { status: response.status });
    }

    // Stream the image back with proper content type and caching
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(body.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Image proxy error:", err);
    return new NextResponse(null, { status: 502 });
  }
}
