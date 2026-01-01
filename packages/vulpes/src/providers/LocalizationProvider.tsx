"use client";

import { ptBR } from "date-fns/locale/pt-BR";

import { LocalizationProvider as MUILocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default function LocalizationProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MUILocalizationProvider adapterLocale={ptBR}>
      {children}
    </MUILocalizationProvider>
  );
}
