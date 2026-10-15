import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WIRA SATYA 96 — Buku Saku Digital & Sistem Kesejahteraan Akpol 1996",
  description: "Sistem Informasi Kesejahteraan, Direktori Penempatan Tugas, dan Kesiapan Purna Tugas Batalyon Wira Satya Akpol 1996 #SelaluBahagia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-slate-100 text-slate-900 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
