import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, slug } = body;

    if (!secret || secret !== REVALIDATION_SECRET) {
      return NextResponse.json({ message: "Invalid or missing secret" }, { status: 401 });
    }

    // Verify HMAC signature for replay protection
    const signature = request.headers.get("X-Webhook-Signature");
    if (signature) {
      const rawBody = JSON.stringify(body);
      const expectedSig = crypto.createHmac("sha256", REVALIDATION_SECRET).update(rawBody).digest("hex");
      if (signature !== expectedSig) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }
    }

    const revalidated: string[] = [];

    if (slug) {
      revalidatePath(`/blog/${slug}`);
      revalidated.push(`/blog/${slug}`);
    }

    revalidatePath("/");
    revalidated.push("/");

    return NextResponse.json({ revalidated: true, paths: revalidated, now: Date.now() });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json({ message: "Revalidation failed", error: String(error) }, { status: 500 });
  }
}
