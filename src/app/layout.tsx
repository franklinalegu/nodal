import type { Metadata } from "next";
import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const mono = JetBrains_Mono({ subsets:["latin"], variable:"--font-mono" });

export const metadata: Metadata = {
  title: "NODAL — Creative intelligence, connected.",
  description: "Private, local-first node-based generative AI creative OS. 100% local, Tauri + SQLite ready.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${mono.variable} antialiased bg-[#08080a] text-zinc-100`}>{children}</body>
    </html>
  );
}
