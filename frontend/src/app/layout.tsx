import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "VGA-ITS | Sistema Tutor Inteligente para Álgebra Linear",
  description: "Sistema Tutor Inteligente para apoio ao ensino de Álgebra Linear - Matrizes e Vetores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased gradient-bg min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
