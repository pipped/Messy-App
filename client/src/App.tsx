import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import { ThemeProvider, useTheme } from "@/lib/theme-context";
import Scanner from "@/pages/scanner";
import Wardrobe from "@/pages/wardrobe";
import Outfits from "@/pages/outfits";
import Profile from "@/pages/profile";
import AddClothing from "@/pages/add-clothing";
import EditClothing from "@/pages/edit-clothing";
import ClothingDetail from "@/pages/clothing-detail";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useTheme();
  const [location] = useLocation();

  if (!user && location !== "/login") {
    return <Redirect to="/login" />;
  }
  if (user && location === "/login") {
    return <Redirect to="/wardrobe" />;
  }
  return <>{children}</>;
}

function Router() {
  const { user } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={() => <Redirect to={user ? "/wardrobe" : "/login"} />} />
        <Route path="/scanner">
          <AuthGuard><Scanner /></AuthGuard>
        </Route>
        <Route path="/wardrobe">
          <AuthGuard><Wardrobe /></AuthGuard>
        </Route>
        <Route path="/outfits">
          <AuthGuard><Outfits /></AuthGuard>
        </Route>
        <Route path="/profile">
          <AuthGuard><Profile /></AuthGuard>
        </Route>
        <Route path="/add">
          <AuthGuard><AddClothing /></AuthGuard>
        </Route>
        <Route path="/clothing/:id">
          <AuthGuard><ClothingDetail /></AuthGuard>
        </Route>
        <Route path="/clothing/:id/edit">
          <AuthGuard><EditClothing /></AuthGuard>
        </Route>
        <Route component={NotFound} />
      </Switch>
      {user && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
