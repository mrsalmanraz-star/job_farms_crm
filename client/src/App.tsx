import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Bookings from "./pages/Bookings";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import BookingRequest from "./pages/BookingRequest";
import Invoices from "./pages/Invoices";
import Search from "./pages/Search";
import Payments from "./pages/Payments";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/booking-request" component={BookingRequest} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/search" component={Search} />
        <Route path="/payments" component={Payments} />
        <Route path="/billing" component={Billing} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
