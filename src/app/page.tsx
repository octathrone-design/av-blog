import Link from "next/link";
import { format } from "date-fns";
import { getPosts, getCategories, extractFeaturedImage, extractCategories, getExcerpt, stripHtml } from "@/lib/wp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | AV Design International",
};

export const revalidate = 60;

export default async function BlogHome({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams.category === "string" ? resolvedParams.category : undefined;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;

  const [posts, categories] = await Promise.all([getPosts(page, 12, category), getCategories()]);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-content mx-auto">
        <div className="border-b border-border pb-8">
          <h1 className="section-heading text-5xl md:text-7xl lg:text-8xl leading-none text-foreground">Blog</h1>
          <p className="mt-6 text-foreground/60 text-lg font-light max-w-2xl leading-relaxed">
            Insights, stories, and perspectives on architecture, interior design,
            and the built environment from the AV Design International team.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 lg:px-12 max-w-content mx-auto pb-12">
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className={`text-xs tracking-[0.2em] uppercase font-body font-light px-5 py-2 border transition-all duration-300 ${
              !category ? "border-foreground bg-foreground text-background" : "border-border text-foreground/60 hover:border-foreground/30"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?category=${cat.slug}`}
              className={`text-xs tracking-[0.2em] uppercase font-body font-light px-5 py-2 border transition-all duration-300 ${
                category === cat.slug ? "border-foreground bg-foreground text-background" : "border-border text-foreground/60 hover:border-foreground/30"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Post Grid */}
      <section className="px-6 lg:px-12 max-w-content mx-auto pb-24">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/50 font-light text-lg">No posts found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {posts.map((post) => {
              const image = extractFeaturedImage(post);
              const cats = extractCategories(post);
              const date = new Date(post.date);

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-[4/3] bg-muted overflow-hidden mb-5">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground/10 font-display text-6xl">AVD</div>
                    )}
                  </div>
                  {cats.length > 0 && (
                    <p className="text-xs tracking-[0.2em] uppercase text-accent font-body font-light mb-2">{cats[0].name}</p>
                  )}
                  <h2 className="font-display text-2xl tracking-[0.05em] uppercase text-foreground group-hover:text-accent transition-colors duration-300 mb-3">
                    {post.title.rendered}
                  </h2>
                  <p className="text-sm text-foreground/60 font-light leading-relaxed line-clamp-2 mb-4">
                    {stripHtml(getExcerpt(post))}
                  </p>
                  <p className="text-xs text-foreground/40 font-light">{format(date, "MMMM dd, yyyy")}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
