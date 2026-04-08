import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Shirt, Package, WashingMachine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useTheme } from "@/lib/theme-context";
import type { Clothing } from "@shared/schema";
import { useWeather } from "@/hooks/use-weather";
import { WeatherWidget } from "@/components/weather-widget";

export default function Wardrobe() {
  const [, setLocation] = useLocation();
  const { user } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showLaundry, setShowLaundry] = useState<"all" | "available" | "laundry">("all");
  const [weatherState, retryWeather] = useWeather();

  const { data: clothes, isLoading } = useQuery<Clothing[]>({
    queryKey: ["/api/clothing"],
  });

  const categories = [
    { id: "all", label: "All", icon: Package },
    { id: "top", label: "Tops", icon: Shirt },
    { id: "bottom", label: "Bottoms", icon: Shirt },
    { id: "shoes", label: "Shoes", icon: Shirt },
    { id: "outerwear", label: "Outerwear", icon: Shirt },
    { id: "accessory", label: "Accessories", icon: Shirt },
  ];

  const filteredClothes = clothes?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesLaundry = showLaundry === "all" ||
      (showLaundry === "available" && item.inLaundry === 0) ||
      (showLaundry === "laundry" && item.inLaundry === 1);
    return matchesSearch && matchesCategory && matchesLaundry;
  }) || [];

  const laundryCount = clothes?.filter((item) => item.inLaundry === 1).length || 0;
  const availableCount = clothes?.filter((item) => item.inLaundry === 0).length || 0;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 p-4 space-y-4 bg-card border-b border-card-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">
              {user ? `Hey, ${user.username.split(" ")[0]}` : "Your"}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-card-foreground">Wardrobe</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {availableCount} available · {laundryCount} in laundry
            </p>
          </div>
          <Button
            data-testid="button-add-clothing"
            size="icon"
            onClick={() => setLocation("/add")}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {weatherState.status === "success" && (
          <WeatherWidget state={weatherState} onRetry={retryWeather} compact />
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search"
            type="search"
            placeholder="Search by name or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-full"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {categories.map((category) => (
            <Badge
              key={category.id}
              data-testid={`filter-${category.id}`}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              className="cursor-pointer flex-shrink-0 px-3 py-2 h-auto hover-elevate active-elevate-2"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Badge
            data-testid="filter-all-status"
            variant={showLaundry === "all" ? "default" : "secondary"}
            className="cursor-pointer px-3 py-2 h-auto hover-elevate active-elevate-2"
            onClick={() => setShowLaundry("all")}
          >
            All Items
          </Badge>
          <Badge
            data-testid="filter-available"
            variant={showLaundry === "available" ? "default" : "secondary"}
            className="cursor-pointer px-3 py-2 h-auto hover-elevate active-elevate-2"
            onClick={() => setShowLaundry("available")}
          >
            Available ({availableCount})
          </Badge>
          <Badge
            data-testid="filter-laundry"
            variant={showLaundry === "laundry" ? "default" : "secondary"}
            className="cursor-pointer px-3 py-2 h-auto hover-elevate active-elevate-2"
            onClick={() => setShowLaundry("laundry")}
          >
            <WashingMachine className="w-3 h-3 mr-1" />
            Laundry ({laundryCount})
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredClothes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Shirt className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || selectedCategory !== "all" || showLaundry !== "all" ? "No items found" : "No clothes yet"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              {searchQuery || selectedCategory !== "all" || showLaundry !== "all"
                ? "Try adjusting your search or filters"
                : "Start scanning RFID tags to build your digital wardrobe"}
            </p>
            {!searchQuery && selectedCategory === "all" && showLaundry === "all" && (
              <Button
                data-testid="button-scan-first"
                onClick={() => setLocation("/scanner")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredClothes.map((item) => (
              <Card
                key={item.id}
                data-testid={`card-clothing-${item.id}`}
                className={`overflow-hidden group cursor-pointer hover-elevate active-elevate-2 ${
                  item.inLaundry === 1 ? "opacity-75" : ""
                }`}
                onClick={() => setLocation(`/clothing/${item.id}`)}
              >
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  {item.inLaundry === 1 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 text-xs">
                        <WashingMachine className="w-3 h-3" />
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-end justify-center p-3 opacity-0 group-hover:opacity-100">
                    <Badge variant="secondary" className="backdrop-blur-sm bg-background/90">
                      View Details
                    </Badge>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-base text-card-foreground truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.color}
                    </span>
                  </div>
                  {item.timesWorn > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Worn {item.timesWorn}x
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
