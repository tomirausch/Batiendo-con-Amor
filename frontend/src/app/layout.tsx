import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Batiendo con Amor - Sistema",
  description: "Sistema de gestión para pastelería",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <div className="flex">
          {/* El Sidebar fijo a la izquierda */}
          <Sidebar />

          {/* El contenido dinámico a la derecha */}
          <div className="flex-1 ml-64 p-8 min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}