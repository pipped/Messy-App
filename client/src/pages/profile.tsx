import { useState, useRef } from "react";
import { User, TrendingUp, AlertTriangle, Shirt, Sun, Snowflake, Leaf, Cloud, BarChart3, Star, Calendar, WashingMachine, Wind, LogOut, Camera, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTheme, type Season } from "@/lib/theme-context";
import type { Clothing, Outfit } from "@shared/schema";

const seasonOptions: { id: Season; label: string; icon: typeof Leaf }[] = [
  { id: "spring", label: "Spring", icon: Leaf },
  { id: "summer", label: "Summer", icon: Sun },
  { id: "fall", label: "Fall", icon: Wind },
  { id: "winter", label: "Winter", icon: Snowflake },
];

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, logout, season, setSeason, updateProfilePicture } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateProfilePicture(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const { data: clothes } = useQuery<Clothing[]>({
    queryKey: ["/api/clothing"],
  });

  const { data: outfits } = useQuery<Outfit[]>({
    queryKey: ["/api/outfits"],
  });

  const totalItems = clothes?.length || 0;
  const totalOutfits = outfits?.length || 0;
  const favoriteOutfits = outfits?.filter((o) => o.isFavorite === 1).length || 0;
  const inLaundryCount = clothes?.filter((c) => c.inLaundry === 1).length || 0;

  const totalWears = clothes?.reduce((sum, item) => sum + item.timesWorn, 0) || 0;
  const avgWears = totalItems > 0 ? Math.round(totalWears / totalItems) : 0;

  const mostWornItems = clothes
    ? [...clothes].sort((a, b) => b.timesWorn - a.timesWorn).slice(0, 5)
    : [];

  const unusedItems = clothes
    ? clothes.filter((item) => item.timesWorn === 0)
    : [];

  const neverWornCount = unusedItems.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const donationSuggestions = clothes
    ? clothes.filter((item) =>
        item.timesWorn === 0 && new Date(item.createdAt) < thirtyDaysAgo
      )
    : [];

  const categoryStats = clothes?.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryLabels: Record<string, string> = {
    top: "Tops",
    bottom: "Bottoms",
    shoes: "Shoes",
    outerwear: "Outerwear",
    accessory: "Accessories",
  };

  const maxCategoryCount = Math.max(...Object.values(categoryStats), 1);

  const seasonStats = clothes?.reduce((acc, item) => {
    acc[item.season] = (acc[item.season] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const seasonLabels: Record<string, { label: string; icon: typeof Sun }> = {
    spring: { label: "Spring", icon: Leaf },
    summer: { label: "Summer", icon: Sun },
    fall: { label: "Fall", icon: Cloud },
    winter: { label: "Winter", icon: Snowflake },
    all: { label: "All Seasons", icon: Calendar },
  };

  const colorStats = clothes?.reduce((acc, item) => {
    const color = item.color.toLowerCase();
    acc[color] = (acc[color] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topColors = Object.entries(colorStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const occasionStats = clothes?.reduce((acc, item) => {
    acc[item.occasion] = (acc[item.occasion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const occasionLabels: Record<string, string> = {
    casual: "Casual",
    formal: "Formal",
    athletic: "Athletic",
    business: "Business",
    any: "Any Occasion",
  };

  const outfitWearStats = outfits?.reduce((sum, outfit) => sum + outfit.timesWorn, 0) || 0;

  const initials = user ? user.username.slice(0, 2).toUpperCase() : "??";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 bg-card border-b border-card-border">
        <div className="p-5 flex items-center gap-4">
          {/* Avatar with edit button */}
          <div className="relative flex-shrink-0">
            <button
              data-testid="button-change-pfp"
              onClick={() => fileRef.current?.click()}
              className="relative group"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary overflow-hidden flex items-center justify-center">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-primary-foreground">{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-2.5 h-2.5 text-muted-foreground" />
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePfpChange}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-card-foreground truncate">{user?.username}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Stats & Insights</p>
          </div>
          <Button
            data-testid="button-logout"
            variant="ghost"
            size="icon"
            onClick={logout}
            className="flex-shrink-0 text-muted-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Season Theme Selector */}
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {seasonOptions.map((s) => {
              const Icon = s.icon;
              const isActive = season === s.id;
              return (
                <button
                  key={s.id}
                  data-testid={`theme-${s.id}`}
                  onClick={() => setSeason(s.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "border-border text-muted-foreground bg-background hover-elevate"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 text-center" data-testid="stat-total-items">
            <p className="text-3xl font-bold text-primary">{totalItems}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Items</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-avg-wears">
            <p className="text-3xl font-bold text-primary">{avgWears}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Wears</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-outfits">
            <p className="text-3xl font-bold text-primary">{totalOutfits}</p>
            <p className="text-xs text-muted-foreground mt-1">Saved Outfits</p>
          </Card>
          <Card className="p-4 text-center" data-testid="stat-laundry">
            <p className="text-3xl font-bold text-amber-500">{inLaundryCount}</p>
            <p className="text-xs text-muted-foreground mt-1">In Laundry</p>
          </Card>
        </div>

        <div className="px-4">
          <Tabs defaultValue="items" className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="items" data-testid="tab-items">
                <Shirt className="w-4 h-4 mr-2" />
                Items
              </TabsTrigger>
              <TabsTrigger value="outfits" data-testid="tab-outfits">
                <Star className="w-4 h-4 mr-2" />
                Outfits
              </TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Most Worn</h3>
                </div>
                {mostWornItems.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No wear data yet</p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {mostWornItems.map((item, index) => (
                      <Card
                        key={item.id}
                        data-testid={`most-worn-${item.id}`}
                        className="p-3 flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2"
                        onClick={() => setLocation(`/clothing/${item.id}`)}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Shirt className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0">
                          {item.timesWorn}x
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">Never Worn</h3>
                  {neverWornCount > 0 && (
                    <Badge variant="outline" className="text-amber-600">
                      {neverWornCount} items
                    </Badge>
                  )}
                </div>
                {unusedItems.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">All items have been worn</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {unusedItems.slice(0, 12).map((item) => (
                      <div
                        key={item.id}
                        data-testid={`unused-${item.id}`}
                        className="aspect-square rounded-lg bg-muted overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                        onClick={() => setLocation(`/clothing/${item.id}`)}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    ))}
                    {unusedItems.length > 12 && (
                      <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
                        +{unusedItems.length - 12}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <WashingMachine className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-foreground">In Laundry</h3>
                </div>
                {inLaundryCount === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">All items are clean</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {clothes?.filter((c) => c.inLaundry === 1).slice(0, 12).map((item) => (
                      <div
                        key={item.id}
                        data-testid={`laundry-${item.id}`}
                        className="aspect-square rounded-lg bg-muted overflow-hidden cursor-pointer hover-elevate active-elevate-2 relative"
                        onClick={() => setLocation(`/clothing/${item.id}`)}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover opacity-75"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1">
                          <WashingMachine className="w-3 h-3 text-amber-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Donation Suggestions</h3>
                  {donationSuggestions.length > 0 && (
                    <Badge variant="outline" className="text-primary">
                      {donationSuggestions.length} items
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Never worn items added over 30 days ago</p>
                {donationSuggestions.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {neverWornCount === 0
                        ? "All items have been worn — great job!"
                        : "No items meet the criteria yet"}
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {donationSuggestions.map((item) => (
                      <Card
                        key={item.id}
                        data-testid={`donation-${item.id}`}
                        className="p-3 flex items-center gap-3 cursor-pointer hover-elevate active-elevate-2"
                        onClick={() => setLocation(`/clothing/${item.id}`)}
                      >
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Shirt className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.category} · Added {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                          Never worn
                        </Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="outfits" className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{favoriteOutfits}</p>
                  <p className="text-xs text-muted-foreground mt-1">Favorites</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{outfitWearStats}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Outfit Wears</p>
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Outfit History</h3>
                {outfits && outfits.length > 0 ? (
                  <div className="space-y-2">
                    {outfits.slice(0, 5).map((outfit) => (
                      <Card
                        key={outfit.id}
                        data-testid={`outfit-stat-${outfit.id}`}
                        className="p-3 flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">{outfit.name}</p>
                            {outfit.isFavorite === 1 && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {outfit.occasion}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {outfit.season}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{outfit.timesWorn}x</p>
                          <p className="text-xs text-muted-foreground">worn</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No outfits saved yet</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Category Breakdown</h3>
                <Card className="p-4 space-y-3">
                  {Object.entries(categoryStats).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No items yet</p>
                  ) : (
                    Object.entries(categoryLabels).map(([key, label]) => {
                      const count = categoryStats[key] || 0;
                      const percent = maxCategoryCount > 0 ? (count / maxCategoryCount) * 100 : 0;
                      return (
                        <div key={key} className="space-y-1" data-testid={`category-${key}`}>
                          <div className="flex justify-between text-sm">
                            <span className="text-foreground">{label}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <Progress value={percent} className="h-2" />
                        </div>
                      );
                    })
                  )}
                </Card>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Seasonal Distribution</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(seasonLabels).map(([key, { label, icon: Icon }]) => {
                    const count = seasonStats[key] || 0;
                    return (
                      <Card
                        key={key}
                        className="p-3 text-center"
                        data-testid={`season-${key}`}
                      >
                        <Icon className="w-5 h-5 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-foreground">{count}</p>
                        <p className="text-xs text-muted-foreground truncate">{label}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Top Colors</h3>
                {topColors.length === 0 ? (
                  <Card className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No color data</p>
                  </Card>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topColors.map(([color, count]) => (
                      <Badge
                        key={color}
                        variant="outline"
                        className="px-3 py-2 capitalize"
                        data-testid={`color-${color}`}
                      >
                        {color}
                        <span className="ml-2 text-muted-foreground">{count}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Occasion Split</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(occasionLabels).map(([key, label]) => {
                    const count = occasionStats[key] || 0;
                    return (
                      <Card
                        key={key}
                        className="p-3 text-center"
                        data-testid={`occasion-${key}`}
                      >
                        <p className="text-xl font-bold text-primary">{count}</p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Wardrobe Health</h3>
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Item Utilization</span>
                    <span className="text-sm font-medium text-primary">
                      {totalItems > 0 ? Math.round(((totalItems - neverWornCount) / totalItems) * 100) : 0}%
                    </span>
                  </div>
                  <Progress
                    value={totalItems > 0 ? ((totalItems - neverWornCount) / totalItems) * 100 : 0}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {totalItems - neverWornCount} of {totalItems} items have been worn
                  </p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 pt-8 text-center">
          <p className="text-xs text-muted-foreground font-semibold">Messy v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">RFID-powered wardrobe organization</p>
        </div>
      </div>
    </div>
  );
}
