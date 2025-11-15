import { User, Settings, Info, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Clothing } from "@shared/schema";

export default function Profile() {
  const { data: clothes } = useQuery<Clothing[]>({
    queryKey: ["/api/clothing"],
  });

  // Compute real statistics from wardrobe data
  const stats = {
    totalItems: clothes?.length || 0,
    topCategory: (() => {
      if (!clothes || clothes.length === 0) return "None";
      const categoryCounts = clothes.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topCat = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
      return topCat ? topCat[0].charAt(0).toUpperCase() + topCat[0].slice(1) : "None";
    })(),
    mostWornColor: (() => {
      if (!clothes || clothes.length === 0) return "None";
      const colorWears = clothes.reduce((acc, item) => {
        acc[item.color] = (acc[item.color] || 0) + item.timesWorn;
        return acc;
      }, {} as Record<string, number>);
      const topColor = Object.entries(colorWears).sort((a, b) => b[1] - a[1])[0];
      return topColor ? topColor[0] : "None";
    })(),
    avgWears: clothes?.length 
      ? Math.round(clothes.reduce((sum, item) => sum + item.timesWorn, 0) / clothes.length)
      : 0,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-card-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-card-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">Wardrobe Manager</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Wardrobe Statistics</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalItems}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Items</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.avgWears}</p>
            <p className="text-sm text-muted-foreground mt-1">Avg. Wears</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-lg font-semibold text-foreground">{stats.topCategory}</p>
            <p className="text-sm text-muted-foreground mt-1">Top Category</p>
          </Card>
          
          <Card className="p-4 text-center">
            <p className="text-lg font-semibold text-foreground">{stats.mostWornColor}</p>
            <p className="text-sm text-muted-foreground mt-1">Favorite Color</p>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        
        <div className="space-y-3">
          <Card className="p-4 flex items-center gap-4 hover-elevate active-elevate-2 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Saved Outfits</h3>
              <p className="text-sm text-muted-foreground">View your favorites</p>
            </div>
            <Badge variant="secondary">0</Badge>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover-elevate active-elevate-2 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Settings</h3>
              <p className="text-sm text-muted-foreground">Preferences & options</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4 hover-elevate active-elevate-2 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">About</h3>
              <p className="text-sm text-muted-foreground">App info & support</p>
            </div>
          </Card>
        </div>
      </div>

      {/* App Info */}
      <div className="p-4 pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Wardrobe Manager v1.0.0
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          RFID-powered clothing organization
        </p>
      </div>
    </div>
  );
}
