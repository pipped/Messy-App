import { Camera, Package, Sparkles, User } from "lucide-react";
import { useLocation } from "wouter";

const navItems = [
  { id: "scanner", label: "Scanner", icon: Camera, path: "/scanner" },
  { id: "wardrobe", label: "Wardrobe", icon: Package, path: "/wardrobe" },
  { id: "outfits", label: "Outfits", icon: Sparkles, path: "/outfits" },
  { id: "profile", label: "Profile", icon: User, path: "/profile" },
];

export function BottomNav() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-card-border z-50">
      <div className="h-full flex items-center justify-around max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location === item.path || 
            (item.path === "/wardrobe" && (location.startsWith("/clothing") || location === "/add"));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors hover-elevate active-elevate-2 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
