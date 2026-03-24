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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-card/90 backdrop-blur-md border-t border-card-border shadow-lg">
        <div className="h-16 flex items-center justify-around max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive =
              location === item.path ||
              (item.path === "/wardrobe" &&
                (location.startsWith("/clothing") || location === "/add"));
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => setLocation(item.path)}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
              >
                <div
                  className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover-elevate"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    className={`text-xs font-medium transition-all duration-200 ${
                      isActive ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
