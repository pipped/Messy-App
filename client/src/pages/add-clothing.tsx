import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { insertClothingSchema, type InsertClothing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";

export default function AddClothing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // Get tag ID from URL if coming from scanner
  const urlParams = new URLSearchParams(window.location.search);
  const scannedTagId = urlParams.get("tagId");

  const form = useForm<InsertClothing>({
    resolver: zodResolver(insertClothingSchema),
    defaultValues: {
      tagId: scannedTagId || "",
      name: "",
      category: "top",
      color: "",
      season: "all",
      occasion: "casual",
      imageUrl: "",
      timesWorn: 0,
    },
  });

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImageUrl(imageUrl);
    form.setValue("imageUrl", imageUrl);
  };

  const addClothingMutation = useMutation({
    mutationFn: (data: InsertClothing) =>
      apiRequest("POST", "/api/clothing", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clothing"] });
      toast({
        title: "Success!",
        description: "Clothing item added to your wardrobe",
      });
      setLocation("/wardrobe");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add clothing item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertClothing) => {
    addClothingMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
        <div className="flex items-center gap-3">
          <Button
            data-testid="button-back"
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/wardrobe")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-card-foreground">Add Clothing</h1>
            {scannedTagId && (
              <p className="text-sm text-muted-foreground">Tag: {scannedTagId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <ObjectUploader
              onUploadComplete={handleImageUpload}
              currentImageUrl={uploadedImageUrl}
            />

            {/* Tag ID */}
            <FormField
              control={form.control}
              name="tagId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag ID *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-tagid"
                      {...field}
                      placeholder="e.g., TAG-ABC123"
                      className="h-12"
                      readOnly={!!scannedTagId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-name"
                      {...field}
                      placeholder="e.g., Blue Denim Jacket"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category" className="h-12">
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

            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-color"
                      {...field}
                      placeholder="e.g., Navy Blue"
                      className="h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Season */}
            <FormField
              control={form.control}
              name="season"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Season *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-season-form" className="h-12">
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

            {/* Occasion */}
            <FormField
              control={form.control}
              name="occasion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Occasion *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-occasion-form" className="h-12">
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

            {/* Submit */}
            <div className="pt-4 pb-24">
              <Button
                data-testid="button-submit"
                type="submit"
                size="lg"
                className="w-full h-12"
                disabled={addClothingMutation.isPending}
              >
                {addClothingMutation.isPending ? "Adding..." : "Add to Wardrobe"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
