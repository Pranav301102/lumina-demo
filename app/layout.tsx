import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumina — Distributed LLM Inference",
  description:
    "Run large language models across distributed machines with dynamic VRAM-aware layer splitting.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-base text-body antialiased">
        {children}
      </body>
    </html>
  );
}
