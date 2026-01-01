import LocalizationProvider from "./LocalizationProvider";
import ServerThemeProvider from "./MUIThemeProvider";
import { NextAuthProvider } from "./NextAuthProvider";
import { ToastContainer } from "react-toastify";

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ServerThemeProvider>
      <LocalizationProvider>
        <NextAuthProvider>{children}</NextAuthProvider>
        <ToastContainer closeOnClick theme="colored" />
      </LocalizationProvider>
    </ServerThemeProvider>
  );
};
