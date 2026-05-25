import Link from "next/link";

const footerLinks = [
  { href: "https://www.avdesignintl.com/about", label: "About" },
  { href: "https://www.avdesignintl.com/portfolio", label: "Portfolio" },
  { href: "https://www.avdesignintl.com/services", label: "Services" },
  { href: "/", label: "Blog" },
  { href: "https://www.avdesignintl.com/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background/80">
      <div className="max-w-content mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-2xl tracking-[0.15em] uppercase text-background">
              AV Design
            </Link>
            <p className="mt-4 text-sm text-background/60 leading-relaxed font-light max-w-xs">
              Crafting immersive experiences that redefine how you engage with architecture and design. Dubai · Krakow.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-[0.15em] uppercase text-background mb-6">Navigation</h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-background/60 hover:text-accent transition-colors duration-300 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-[0.15em] uppercase text-background mb-6">Dubai, UAE</h3>
            <ul className="space-y-3 text-sm text-background/60 font-light">
              <li>P.O Box 410492, Dubai, UAE</li>
              <li><a href="tel:+971502112584" className="hover:text-accent transition-colors">+971 50 2112584</a></li>
              <li><a href="mailto:info@avdesignintl.com" className="hover:text-accent transition-colors">info@avdesignintl.com</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg tracking-[0.15em] uppercase text-background mb-6">Krakow, Poland</h3>
            <ul className="space-y-3 text-sm text-background/60 font-light">
              <li>Krakow, Poland</li>
              <li><a href="tel:+48782244934" className="hover:text-accent transition-colors">+48 782 244 934</a></li>
              <li><a href="mailto:europe@avdesignintl.com" className="hover:text-accent transition-colors">europe@avdesignintl.com</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/40 font-light">
            &copy; {year} AV Design International. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://ae.linkedin.com/company/av-design-international" target="_blank" rel="noopener noreferrer"
              className="text-xs text-background/40 hover:text-accent transition-colors uppercase tracking-[0.1em] font-light">LinkedIn</a>
            <a href="https://www.instagram.com/avdesignintl" target="_blank" rel="noopener noreferrer"
              className="text-xs text-background/40 hover:text-accent transition-colors uppercase tracking-[0.1em] font-light">Instagram</a>
            <a href="https://www.facebook.com/Avdesignintl/" target="_blank" rel="noopener noreferrer"
              className="text-xs text-background/40 hover:text-accent transition-colors uppercase tracking-[0.1em] font-light">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
