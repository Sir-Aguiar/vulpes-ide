"use client";

import LocalizationProvider from "./LocalizationProvider";
import { ColorModeProvider, useColorMode } from "./ColorModeProvider";
import ServerThemeProvider from "./MUIThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { BugReportProvider } from "./BugReportProvider";
import { ToastContainer } from "react-toastify";

function ThemedToastContainer() {
  const { isDark } = useColorMode();
  return <ToastContainer closeOnClick theme={isDark ? "dark" : "light"} />;
}

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ColorModeProvider>
      <ServerThemeProvider>
        <LocalizationProvider>
          <AuthProvider>
            <BugReportProvider>{children}</BugReportProvider>
          </AuthProvider>
          <ThemedToastContainer />
        </LocalizationProvider>
      </ServerThemeProvider>
    </ColorModeProvider>
  );
};
