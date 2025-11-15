import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Pencil, Trash2, Clock, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";
import type { Clothing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ClothingDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: item, isLoading } = useQuery<Clothing>({
    queryKey: ["/api/clothing", id],
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/clothing/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clothing"] });
      toast({
        title: "Deleted",
        description: "Clothing item removed from wardrobe",
      });
      setLocation("/wardrobe");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const markAsWornMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", `/api/clothing/${id}/worn`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clothing", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/clothing"] });
      toast({
        title: "Updated",
        description: "Marked as worn today",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="w-full aspect-video" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-card-border p-4">
        <div className="flex items-center justify-between">
          <Button
            data-testid="button-back-detail"
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/wardrobe")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              data-testid="button-edit"
              variant="ghost"
              size="icon"
              onClick={() => toast({ title: "Edit feature", description: "Coming soon!" })}
            >
              <Pencil className="w-5 h-5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-testid="button-delete"
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently remove "{item.name}" from your wardrobe.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    data-testid="button-confirm-delete"
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="w-full aspect-video bg-muted relative">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="w-24 h-24 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-6">
        {/* Title & Badges */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="capitalize">
              {item.category}
            </Badge>
            <Badge variant="outline">{item.color}</Badge>
            <Badge variant="outline" className="capitalize">{item.season}</Badge>
            <Badge variant="outline" className="capitalize">{item.occasion}</Badge>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <p className="text-4xl font-bold text-primary">{item.timesWorn}</p>
            <p className="text-sm text-muted-foreground mt-1">Times Worn</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm font-medium text-foreground">Tag ID</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {item.tagId}
            </p>
          </Card>
        </div>

        {/* Last Worn */}
        {item.lastWorn && (
          <Card className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Last Worn</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(item.lastWorn).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            data-testid="button-mark-worn"
            size="lg"
            className="w-full h-12"
            onClick={() => markAsWornMutation.mutate()}
            disabled={markAsWornMutation.isPending}
          >
            <Clock className="w-5 h-5 mr-2" />
            {markAsWornMutation.isPending ? "Updating..." : "Mark as Worn Today"}
          </Button>
        </div>
      </div>
    </div>
  );
}
