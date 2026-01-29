import LocalizationProvider from "./LocalizationProvider";
import ServerThemeProvider from "./MUIThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { ToastContainer } from "react-toastify";

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ServerThemeProvider>
      <LocalizationProvider>
        <AuthProvider>{children}</AuthProvider>
        <ToastContainer closeOnClick theme="colored" />
      </LocalizationProvider>
    </ServerThemeProvider>
  );
};
