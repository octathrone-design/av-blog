import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 pt-20">
      <h1 className="font-display text-8xl text-foreground/10">404</h1>
      <h2 className="font-display text-3xl tracking-[0.05em] uppercase mt-4 mb-4">Page Not Found</h2>
      <p className="text-foreground/60 font-light mb-8">This article doesn&apos;t exist or has been removed.</p>
      <Link href="/" className="text-sm font-body font-light tracking-[0.2em] uppercase border border-foreground px-6 py-2.5 transition-all duration-300 hover:bg-foreground hover:text-background">
        Back to Blog
      </Link>
    </div>
  );
}
