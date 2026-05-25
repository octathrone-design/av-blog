"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "https://www.avdesignintl.com/about", label: "About" },
  { href: "https://www.avdesignintl.com/portfolio", label: "Portfolio" },
  { href: "https://www.avdesignintl.com/services", label: "Services" },
  { href: "https://www.avdesignintl.com/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-content mx-auto px-6 lg:px-12">
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="z-50 flex items-center gap-2">
            <span className="font-display text-2xl tracking-[0.15em] uppercase text-foreground">
              AV Design
            </span>
            <span className="text-xs text-accent font-display tracking-[0.2em] uppercase hidden sm:block">
              Blog
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const isActive =
                pathname === link.href ||
                (link.href === "/blog" && pathname.startsWith("/blog") && pathname !== "/");

              if (isExternal) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-body font-light tracking-[0.2em] uppercase text-foreground/60 hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-body font-light tracking-[0.2em] uppercase transition-colors duration-300 ${
                    isActive ? "text-accent" : "text-foreground/60 hover:text-accent"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              href="https://www.avdesignintl.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-body font-light tracking-[0.2em] uppercase border border-foreground px-6 py-2.5 transition-all duration-300 text-foreground hover:bg-foreground hover:text-background"
            >
              Start a Project
            </Link>
          </div>

          <button
            className="lg:hidden z-50 flex flex-col gap-1.5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-[1.5px] bg-foreground transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-6 h-[1.5px] bg-foreground transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-[1.5px] bg-foreground transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </nav>
      </div>

      <div className={`fixed inset-0 bg-background flex flex-col items-center justify-center gap-8 transition-all duration-500 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {navLinks.map((link) => {
          const isExternal = link.href.startsWith("http");
          if (isExternal) {
            return (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                className="text-2xl font-body font-light tracking-[0.2em] uppercase text-foreground/70 hover:text-accent transition-colors"
                onClick={() => setOpen(false)}>
                {link.label}
              </a>
            );
          }
          return (
            <Link key={link.href} href={link.href}
              className="text-2xl font-body font-light tracking-[0.2em] uppercase text-foreground/70 hover:text-accent transition-colors"
              onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
