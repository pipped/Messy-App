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

function PageWrapper({ children, animKey }: { children: React.ReactNode; animKey: string }) {
  return (
    <div key={animKey} className="page-enter">
      {children}
    </div>
  );
}

function MainApp() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={() => <Redirect to="/wardrobe" />} />
        <Route path="/scanner">
          <PageWrapper animKey="scanner"><Scanner /></PageWrapper>
        </Route>
        <Route path="/wardrobe">
          <PageWrapper animKey="wardrobe"><Wardrobe /></PageWrapper>
        </Route>
        <Route path="/outfits">
          <PageWrapper animKey="outfits"><Outfits /></PageWrapper>
        </Route>
        <Route path="/profile">
          <PageWrapper animKey="profile"><Profile /></PageWrapper>
        </Route>
        <Route path="/add">
          <PageWrapper animKey="add"><AddClothing /></PageWrapper>
        </Route>
        <Route path="/clothing/:id/edit">
          {(params) => (
            <PageWrapper animKey={`edit-${params.id}`}><EditClothing /></PageWrapper>
          )}
        </Route>
        <Route path="/clothing/:id">
          {(params) => (
            <PageWrapper animKey={`clothing-${params.id}`}><ClothingDetail /></PageWrapper>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
    </div>
  );
}

function AppContent() {
  const { user } = useTheme();

  return (
    <div key={user ? "app" : "login"} className="screen-enter">
      {user ? <MainApp /> : <Login />}
    </div>
  );
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
