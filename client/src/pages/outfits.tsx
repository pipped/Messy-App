import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sparkles, RefreshCw, Heart, Clock, Shirt, Trash2, Check } from "lucide-react";
import { useWeather } from "@/hooks/use-weather";
import { WeatherWidget } from "@/components/weather-widget";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Clothing, Outfit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [weatherState, retryWeather] = useWeather();

  const { data: clothes, isLoading: clothesLoading } = useQuery<Clothing[]>({
    queryKey: ["/api/clothing"],
  });

  const { data: savedOutfits, isLoading: outfitsLoading } = useQuery<Outfit[]>({
    queryKey: ["/api/outfits"],
  });

  const saveOutfitMutation = useMutation({
    mutationFn: (data: { name: string; clothingIds: string[]; occasion: string; season: string; isFavorite?: number }) =>
      apiRequest("POST", "/api/outfits", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      setShowSaveDialog(false);
      setOutfitName("");
      toast({
        title: "Outfit saved!",
        description: "Added to your outfit history",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save outfit",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/outfits/${id}/favorite`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
    },
  });

  const markWornMutation = useMutation({
    mutationFn: (id: string) => apiRequest("PATCH", `/api/outfits/${id}/worn`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      toast({
        title: "Updated",
        description: "Marked as worn today",
      });
    },
  });

  const deleteOutfitMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/outfits/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/outfits"] });
      toast({
        title: "Deleted",
        description: "Outfit removed from history",
      });
    },
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

    const availableClothes = clothes.filter((item) => item.inLaundry !== 1);
    
    if (availableClothes.length === 0) {
      toast({
        title: "All clothes in laundry",
        description: "Mark some items as clean first!",
        variant: "destructive",
      });
      return;
    }

    const filtered = availableClothes.filter((item) => {
      const matchesOccasion = occasion === "any" || item.occasion === occasion || item.occasion === "any";
      const matchesSeason = season === "all" || item.season === season || item.season === "all";
      return matchesOccasion && matchesSeason;
    });

    if (filtered.length === 0) {
      toast({
        title: "No matching items",
        description: "Try adjusting your filters or check laundry",
        variant: "destructive",
      });
      return;
    }

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

  const handleSaveOutfit = () => {
    if (!currentOutfit) return;
    const clothingIds = Object.values(currentOutfit).filter(Boolean).map((item) => item!.id);
    if (clothingIds.length === 0) return;

    const name = outfitName.trim() || `Outfit ${new Date().toLocaleDateString()}`;
    saveOutfitMutation.mutate({
      name,
      clothingIds,
      occasion,
      season,
      isFavorite: 0,
    });
  };

  const handleSaveAsFavorite = () => {
    if (!currentOutfit) return;
    const clothingIds = Object.values(currentOutfit).filter(Boolean).map((item) => item!.id);
    if (clothingIds.length === 0) return;

    const name = `Favorite ${new Date().toLocaleDateString()}`;
    saveOutfitMutation.mutate({
      name,
      clothingIds,
      occasion,
      season,
      isFavorite: 1,
    });
  };

  const outfitItems = currentOutfit ? Object.values(currentOutfit).filter(Boolean) : [];
  const favoriteOutfits = savedOutfits?.filter((o) => o.isFavorite === 1) || [];
  const allOutfits = savedOutfits || [];

  const getClothingById = (id: string) => clothes?.find((c) => c.id === id);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-shrink-0 p-4 bg-card border-b border-card-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Outfits</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Generate and save outfit combinations
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="generate" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate" data-testid="tab-generate">Generate</TabsTrigger>
            <TabsTrigger value="favorites" data-testid="tab-favorites">
              Favorites {favoriteOutfits.length > 0 && `(${favoriteOutfits.length})`}
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              History {allOutfits.length > 0 && `(${allOutfits.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generate" className="flex-1 overflow-y-auto mt-0 pb-24">
          <div className="p-4 space-y-3">
            <WeatherWidget
              state={weatherState}
              onRetry={retryWeather}
              onApplySeason={(s) => setSeason(s)}
            />

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

          <div className="p-4">
            {clothesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-96 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : !currentOutfit ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
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
                <div className="grid grid-cols-1 gap-4">
                  {outfitItems.length > 0 ? (
                    outfitItems.map((item) => (
                      <Card
                        key={item.id}
                        data-testid={`outfit-item-${item.id}`}
                        className="flex items-center gap-4 p-4 hover-elevate"
                      >
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
                      onClick={() => setShowSaveDialog(true)}
                      disabled={outfitItems.length === 0}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      data-testid="button-save-favorite"
                      variant="outline"
                      onClick={handleSaveAsFavorite}
                      disabled={outfitItems.length === 0 || saveOutfitMutation.isPending}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Favorite
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 overflow-y-auto mt-0 pb-24">
          <div className="p-4 space-y-4">
            {outfitsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : favoriteOutfits.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No favorite outfits yet
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Generate an outfit and save it as a favorite to see it here
                </p>
              </div>
            ) : (
              favoriteOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  clothes={clothes || []}
                  onToggleFavorite={() => toggleFavoriteMutation.mutate(outfit.id)}
                  onMarkWorn={() => markWornMutation.mutate(outfit.id)}
                  onDelete={() => deleteOutfitMutation.mutate(outfit.id)}
                  onRegenerate={() => {
                    const regeneratedOutfit: GeneratedOutfit = {};
                    outfit.clothingIds.forEach((id) => {
                      const item = getClothingById(id);
                      if (item) {
                        regeneratedOutfit[item.category as keyof GeneratedOutfit] = item;
                      }
                    });
                    setCurrentOutfit(regeneratedOutfit);
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-y-auto mt-0 pb-24">
          <div className="p-4 space-y-4">
            {outfitsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : allOutfits.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <Clock className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No outfit history yet
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Generate and save outfits to build your history
                </p>
              </div>
            ) : (
              allOutfits.map((outfit) => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  clothes={clothes || []}
                  onToggleFavorite={() => toggleFavoriteMutation.mutate(outfit.id)}
                  onMarkWorn={() => markWornMutation.mutate(outfit.id)}
                  onDelete={() => deleteOutfitMutation.mutate(outfit.id)}
                  onRegenerate={() => {
                    const regeneratedOutfit: GeneratedOutfit = {};
                    outfit.clothingIds.forEach((id) => {
                      const item = getClothingById(id);
                      if (item) {
                        regeneratedOutfit[item.category as keyof GeneratedOutfit] = item;
                      }
                    });
                    setCurrentOutfit(regeneratedOutfit);
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
            <DialogDescription>
              Give your outfit a name to save it to your history
            </DialogDescription>
          </DialogHeader>
          <Input
            data-testid="input-outfit-name"
            placeholder="e.g., Casual Friday Look"
            value={outfitName}
            onChange={(e) => setOutfitName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              data-testid="button-confirm-save"
              onClick={handleSaveOutfit}
              disabled={saveOutfitMutation.isPending}
            >
              {saveOutfitMutation.isPending ? "Saving..." : "Save Outfit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface OutfitCardProps {
  outfit: Outfit;
  clothes: Clothing[];
  onToggleFavorite: () => void;
  onMarkWorn: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
}

function OutfitCard({ outfit, clothes, onToggleFavorite, onMarkWorn, onDelete, onRegenerate }: OutfitCardProps) {
  const outfitClothes = outfit.clothingIds
    .map((id) => clothes.find((c) => c.id === id))
    .filter(Boolean) as Clothing[];

  return (
    <Card data-testid={`outfit-card-${outfit.id}`} className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base text-card-foreground truncate">
            {outfit.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-xs capitalize">
              {outfit.occasion}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {outfit.season}
            </Badge>
            {outfit.timesWorn > 0 && (
              <span className="text-xs text-muted-foreground">
                Worn {outfit.timesWorn}x
              </span>
            )}
          </div>
          {outfit.lastWorn && (
            <p className="text-xs text-muted-foreground mt-1">
              Last worn: {new Date(outfit.lastWorn).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          data-testid={`button-favorite-${outfit.id}`}
          onClick={onToggleFavorite}
        >
          <Heart
            className={`w-5 h-5 ${outfit.isFavorite === 1 ? "fill-red-500 text-red-500" : ""}`}
          />
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {outfitClothes.map((item) => (
          <div
            key={item.id}
            className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden"
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
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          data-testid={`button-wear-${outfit.id}`}
          onClick={onMarkWorn}
          className="flex-1"
        >
          <Clock className="w-4 h-4 mr-1" />
          Wear Today
        </Button>
        <Button
          size="sm"
          variant="outline"
          data-testid={`button-regenerate-${outfit.id}`}
          onClick={onRegenerate}
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Load
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete outfit?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove "{outfit.name}" from your history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                data-testid={`button-confirm-delete-${outfit.id}`}
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}
