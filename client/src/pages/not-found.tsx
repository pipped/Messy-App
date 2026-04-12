import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PackageSearch } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <PackageSearch className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-foreground">Page not found</h1>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
        </div>
        <Button onClick={() => setLocation("/wardrobe")} className="w-full">
          Go to Wardrobe
        </Button>
      </Card>
    </div>
  );
}
