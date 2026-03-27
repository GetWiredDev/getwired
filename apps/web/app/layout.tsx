import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetWired - Human-Like AI Testing CLI",
  description:
    "GetWired is a human-like AI testing CLI. Test websites and apps with intelligent regression testing powered by your AI provider of choice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
