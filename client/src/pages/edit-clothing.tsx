import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertClothingSchema, type InsertClothing, type Clothing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";

export default function EditClothing() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const { data: item, isLoading } = useQuery<Clothing>({
    queryKey: ["/api/clothing", id],
  });

  const form = useForm<InsertClothing>({
    resolver: zodResolver(insertClothingSchema),
    defaultValues: {
      tagId: "",
      name: "",
      category: "top",
      color: "",
      season: "all",
      occasion: "casual",
      imageUrl: "",
      timesWorn: 0,
      inLaundry: 0,
      washingInstructions: "",
      notes: "",
      purchasePrice: "",
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        tagId: item.tagId,
        name: item.name,
        category: item.category as "top" | "bottom" | "shoes" | "outerwear" | "accessory",
        color: item.color,
        season: item.season as "spring" | "summer" | "fall" | "winter" | "all",
        occasion: item.occasion as "casual" | "formal" | "athletic" | "business" | "any",
        imageUrl: item.imageUrl || "",
        timesWorn: item.timesWorn,
        inLaundry: item.inLaundry,
        washingInstructions: item.washingInstructions || "",
        notes: item.notes || "",
        purchasePrice: item.purchasePrice || "",
      });
      setUploadedImageUrl(item.imageUrl || null);
    }
  }, [item, form]);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    form.setValue("imageUrl", imageUrl);
  };

  const updateClothingMutation = useMutation({
    mutationFn: async (data: Partial<InsertClothing>) => {
      const res = await apiRequest("PATCH", `/api/clothing/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clothing"] });
      queryClient.invalidateQueries({ queryKey: ["/api/clothing", id] });
      toast({
        title: "Updated!",
        description: "Clothing item has been updated",
      });
      setLocation(`/clothing/${id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update clothing item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertClothing) => {
    const editableData = {
      tagId: data.tagId,
      name: data.name,
      category: data.category,
      color: data.color,
      season: data.season,
      occasion: data.occasion,
      imageUrl: data.imageUrl,
      washingInstructions: data.washingInstructions || null,
      notes: data.notes || null,
      purchasePrice: data.purchasePrice || null,
    };
    updateClothingMutation.mutate(editableData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-40" />
          </div>
        </div>
        <div className="p-4 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Item not found</h2>
          <Button onClick={() => setLocation("/wardrobe")}>
            Back to Wardrobe
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
        <div className="flex items-center gap-3">
          <Button
            data-testid="button-back-edit"
            variant="ghost"
            size="icon"
            onClick={() => setLocation(`/clothing/${id}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Edit Item</h1>
            <p className="text-sm text-muted-foreground">{item.name}</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ObjectUploader
              onUploadComplete={handleImageUpload}
              currentImageUrl={uploadedImageUrl}
            />

            <FormField
              control={form.control}
              name="tagId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag ID *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-tagid-edit"
                      {...field}
                      placeholder="e.g., TAG-ABC123"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-name-edit"
                      {...field}
                      placeholder="e.g., Blue Denim Jacket"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category-edit" className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
                      <SelectItem value="outerwear">Outerwear</SelectItem>
                      <SelectItem value="accessory">Accessory</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-color-edit"
                      {...field}
                      placeholder="e.g., Navy Blue"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="season"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-season-edit" className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="winter">Winter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occasion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occasion *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-occasion-edit" className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="athletic">Athletic</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Purchase Price */}
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Price (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        data-testid="input-purchase-price-edit"
                        {...field}
                        value={field.value ?? ""}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="h-12 pl-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Washing Instructions */}
            <FormField
              control={form.control}
              name="washingInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Washing Instructions (optional)</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-washing-edit"
                      {...field}
                      value={field.value ?? ""}
                      placeholder="e.g., Machine wash cold, hang dry"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-notes-edit"
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Any personal notes about this item…"
                      className="min-h-24 resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 pb-24">
              <Button
                data-testid="button-save-edit"
                type="submit"
                size="lg"
                className="w-full h-12"
                disabled={updateClothingMutation.isPending}
              >
                {updateClothingMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
