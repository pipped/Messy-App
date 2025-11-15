import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNav } from "@/components/bottom-nav";
import Scanner from "@/pages/scanner";
import Wardrobe from "@/pages/wardrobe";
import Outfits from "@/pages/outfits";
import Profile from "@/pages/profile";
import AddClothing from "@/pages/add-clothing";
import ClothingDetail from "@/pages/clothing-detail";
import NotFound from "@/pages/not-found";

function Router() {
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
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
