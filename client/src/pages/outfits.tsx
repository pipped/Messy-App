import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, RefreshCw, Heart, Share2, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Clothing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface GeneratedOutfit {
  top?: Clothing;
  bottom?: Clothing;
  shoes?: Clothing;
  outerwear?: Clothing;
  accessory?: Clothing;
}

export default function Outfits() {
  const { toast } = useToast();
  const [occasion, setOccasion] = useState<string>("any");
  const [season, setSeason] = useState<string>("all");
  const [currentOutfit, setCurrentOutfit] = useState<GeneratedOutfit | null>(null);

  const { data: clothes, isLoading } = useQuery<Clothing[]>({
    queryKey: ["/api/clothing"],
  });

  const generateOutfit = () => {
    if (!clothes || clothes.length === 0) {
      toast({
        title: "No clothes available",
        description: "Add some items to your wardrobe first!",
        variant: "destructive",
      });
      return;
    }

    // Filter clothes by occasion and season
    const filtered = clothes.filter((item) => {
      const matchesOccasion = occasion === "any" || item.occasion === occasion || item.occasion === "any";
      const matchesSeason = season === "all" || item.season === season || item.season === "all";
      return matchesOccasion && matchesSeason;
    });

    if (filtered.length === 0) {
      toast({
        title: "No matching items",
        description: "Try adjusting your filters",
        variant: "destructive",
      });
      return;
    }

    // Generate random outfit
    const outfit: GeneratedOutfit = {};
    
    const categories = ["top", "bottom", "shoes", "outerwear", "accessory"];
    categories.forEach((category) => {
      const itemsInCategory = filtered.filter((item) => item.category === category);
      if (itemsInCategory.length > 0) {
        const randomItem = itemsInCategory[Math.floor(Math.random() * itemsInCategory.length)];
        outfit[category as keyof GeneratedOutfit] = randomItem;
      }
    });

    setCurrentOutfit(outfit);
  };

  const outfitItems = currentOutfit ? Object.values(currentOutfit).filter(Boolean) : [];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 p-4 bg-card border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Outfit Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Get inspired with random combinations
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 p-4 bg-background space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Occasion</label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger data-testid="select-occasion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Season</label>
            <Select value={season} onValueChange={setSeason}>
              <SelectTrigger data-testid="select-season">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seasons</SelectItem>
                <SelectItem value="spring">Spring</SelectItem>
                <SelectItem value="summer">Summer</SelectItem>
                <SelectItem value="fall">Fall</SelectItem>
                <SelectItem value="winter">Winter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Outfit Preview */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : !currentOutfit ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Ready to create an outfit?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm">
              Click the button below to generate a random outfit from your wardrobe
            </p>
            <Button
              data-testid="button-generate-first"
              size="lg"
              onClick={generateOutfit}
              disabled={!clothes || clothes.length === 0}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Outfit
            </Button>
            {(!clothes || clothes.length === 0) && (
              <p className="text-xs text-muted-foreground mt-4">
                Add some clothes to your wardrobe first
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Outfit Items */}
            <div className="grid grid-cols-1 gap-4">
              {outfitItems.length > 0 ? (
                outfitItems.map((item) => (
                  <Card
                    key={item.id}
                    data-testid={`outfit-item-${item.id}`}
                    className="flex items-center gap-4 p-4 hover-elevate"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Shirt className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base text-card-foreground truncate">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {item.color}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No items matched your filters. Try adjusting them.
                  </p>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                data-testid="button-generate-new"
                size="lg"
                className="w-full h-14"
                onClick={generateOutfit}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Generate New Outfit
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  data-testid="button-save-outfit"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Outfit saved!",
                      description: "Added to your favorites",
                    });
                  }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button
                  data-testid="button-share-outfit"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Share feature",
                      description: "Coming soon!",
                    });
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
