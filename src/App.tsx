import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./components/AppLayout";
import Index from "./pages/Index";
import SuperAdmin from "./pages/SuperAdmin";
import Cases from "./pages/Cases";
import NewCase from "./pages/NewCase";
import Clients from "./pages/Clients";
import NewClient from "./pages/NewClient";
import AiDocs from "./pages/AiDocs";
import CalendarPage from "./pages/Calendar";
import Library from "./pages/Library";
import Tasks from "./pages/Tasks";
import AiAssistant from "./pages/AiAssistant";
import Documents from "./pages/Documents";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/super-admin" element={<SuperAdmin />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/new" element={<NewCase />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/clients/new" element={<NewClient />} />
                <Route path="/ai-docs" element={<AiDocs />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/library" element={<Library />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/ai-assistant" element={<AiAssistant />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
