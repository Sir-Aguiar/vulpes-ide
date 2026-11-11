import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso e Privacidade — Vulpes IDE",
  description:
    "Termos de uso e política de privacidade da plataforma educacional Vulpes IDE.",
};

export default function TermosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
