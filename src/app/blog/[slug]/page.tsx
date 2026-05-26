import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { getPost, getRecentPosts, extractFeaturedImage, extractCategories, getPosts, getExcerpt } from "@/lib/wp";
import { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getPosts(1, 50);
    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    // Build will fall back to server-side rendering if WP is unreachable
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getPost(slug);
    if (!post) return { title: "Post Not Found | AV Design International" };

    const desc = stripHtml(getExcerpt(post)).slice(0, 160);

    return {
      title: `${post.title.rendered} | AV Design International`,
      description: desc,
      openGraph: {
        title: post.title.rendered,
        description: desc,
        type: "article",
        publishedTime: post.date,
      },
    };
  } catch {
    return { title: "Blog | AV Design International" };
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const image = extractFeaturedImage(post);
  const cats = extractCategories(post);
  const recentPosts = await getRecentPosts(3);
  const date = new Date(post.date);

  return (
    <>
      <section className="pt-32 pb-12 px-6 lg:px-12 max-w-content mx-auto">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-block text-xs tracking-[0.2em] uppercase text-foreground/50 hover:text-accent font-body font-light transition-colors mb-8">
            &larr; Back to Blog
          </Link>

          {cats.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {cats.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.slug}`}
                  className="text-xs tracking-[0.2em] uppercase text-accent font-body font-light border border-accent/30 px-3 py-1 hover:bg-accent hover:text-background transition-colors duration-300"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-none tracking-[0.03em] uppercase text-foreground mb-4">
            {post.title.rendered}
          </h1>

          <div className="flex items-center gap-4 text-sm text-foreground/50 font-light mt-6 pb-8 border-b border-border">
            <time dateTime={post.date}>{format(date, "MMMM dd, yyyy")}</time>
            <span className="text-foreground/20">&middot;</span>
            <span>{Math.ceil(post.content.rendered.split(" ").length / 200)} min read</span>
          </div>
        </div>
      </section>

      {image && (
        <section className="px-6 lg:px-12 max-w-content mx-auto pb-12">
          <div className="aspect-[16/7] bg-muted overflow-hidden rounded-sm">
            <img src={image.url} alt={image.alt} width={image.width} height={image.height} className="w-full h-full object-cover" fetchPriority="high" />
          </div>
        </section>
      )}

      <article className="px-6 lg:px-12 max-w-content mx-auto pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />

          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-foreground/40 font-body font-light mb-4">Share this article</p>
            <div className="flex gap-4">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://blog.avdesignintl.com/blog/${post.slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-body font-light tracking-[0.2em] uppercase text-foreground/50 hover:text-accent transition-colors">LinkedIn</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title.rendered)}&url=${encodeURIComponent(`https://blog.avdesignintl.com/blog/${post.slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-body font-light tracking-[0.2em] uppercase text-foreground/50 hover:text-accent transition-colors">X / Twitter</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://blog.avdesignintl.com/blog/${post.slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-body font-light tracking-[0.2em] uppercase text-foreground/50 hover:text-accent transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </article>

      <section className="bg-muted py-20 px-6 lg:px-12">
        <div className="max-w-content mx-auto">
          <div className="flex items-end justify-between mb-12">
            <h2 className="section-heading text-3xl md:text-4xl">Recent Posts</h2>
            <Link href="/" className="text-xs tracking-[0.2em] uppercase font-body font-light text-foreground/50 hover:text-accent transition-colors hidden sm:inline">
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentPosts.filter((p) => p.slug !== slug).slice(0, 3).map((rp) => {
              const rpImage = extractFeaturedImage(rp);
              return (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group">
                  <div className="aspect-[4/3] bg-background overflow-hidden mb-4">
                    {rpImage ? (
                      <img src={rpImage.url} alt={rpImage.alt} width={rpImage.width} height={rpImage.height}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/10 font-display text-4xl">AVD</div>
                    )}
                  </div>
                  <h3 className="font-display text-xl tracking-[0.05em] uppercase text-foreground group-hover:text-accent transition-colors">
                    {rp.title.rendered}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
