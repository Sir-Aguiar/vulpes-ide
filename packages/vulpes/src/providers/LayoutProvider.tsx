import LocalizationProvider from "./LocalizationProvider";
import { ColorModeProvider } from "./ColorModeProvider";
import ServerThemeProvider from "./MUIThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { ToastContainer } from "react-toastify";

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ColorModeProvider>
      <ServerThemeProvider>
        <LocalizationProvider>
          <AuthProvider>{children}</AuthProvider>
          <ToastContainer closeOnClick theme="colored" />
        </LocalizationProvider>
      </ServerThemeProvider>
    </ColorModeProvider>
  );
};
