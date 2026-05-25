import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Blog | AV Design International",
    template: "%s | AV Design International",
  },
  description:
    "Insights on architecture, interior design, and project management from AV Design International — Dubai & Krakow.",
  openGraph: {
    title: "Blog | AV Design International",
    description:
      "Insights on architecture, interior design, and project management.",
    siteName: "AV Design International",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
