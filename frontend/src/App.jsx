import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;