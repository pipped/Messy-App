import { Switch, Route, Redirect } from "wouter";
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

function MainApp() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={() => <Redirect to="/wardrobe" />} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/wardrobe" component={Wardrobe} />
        <Route path="/outfits" component={Outfits} />
        <Route path="/profile" component={Profile} />
        <Route path="/add" component={AddClothing} />
        <Route path="/clothing/:id" component={ClothingDetail} />
        <Route path="/clothing/:id/edit" component={EditClothing} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function AppContent() {
  const { user } = useTheme();

  if (!user) {
    return <Login />;
  }

  return <MainApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <AppContent />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
