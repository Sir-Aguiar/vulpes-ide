import LocalizationProvider from "./LocalizationProvider";
import { ColorModeProvider } from "./ColorModeProvider";
import ServerThemeProvider from "./MUIThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { BugReportProvider } from "./BugReportProvider";
import { ToastContainer } from "react-toastify";

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ColorModeProvider>
      <ServerThemeProvider>
        <LocalizationProvider>
          <AuthProvider>
            <BugReportProvider>{children}</BugReportProvider>
          </AuthProvider>
          <ToastContainer closeOnClick theme="colored" />
        </LocalizationProvider>
      </ServerThemeProvider>
    </ColorModeProvider>
  );
};
