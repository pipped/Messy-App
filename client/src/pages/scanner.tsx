import { useState } from "react";
import { Camera, CheckCircle2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedTag, setScannedTag] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate RFID tag scanning
    setTimeout(() => {
      const mockTagId = `TAG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setScannedTag(mockTagId);
      setIsScanning(false);
      setShowSuccess(true);
      
      // Navigate to add clothing form with tag ID
      setTimeout(() => {
        setShowSuccess(false);
        setLocation(`/add?tagId=${mockTagId}`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Camera View */}
      <div className="relative flex-1 bg-gradient-to-b from-muted/20 to-muted/40 flex items-center justify-center overflow-hidden">
        {/* Scanning Target Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className={`relative w-full max-w-sm aspect-square border-2 ${isScanning ? 'border-primary animate-pulse' : 'border-muted-foreground/30'} rounded-lg`}>
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-lg" />
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {showSuccess ? (
                <CheckCircle2 className="w-24 h-24 text-primary animate-in zoom-in duration-300" />
              ) : (
                <Scan className={`w-16 h-16 text-muted-foreground ${isScanning ? 'animate-pulse' : ''}`} />
              )}
            </div>
          </div>
        </div>

        {/* Success Animation Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-primary/10 animate-in fade-in duration-300" />
        )}
      </div>

      {/* Instructions & Scan Button */}
      <div className="p-6 space-y-4 bg-card backdrop-blur-md">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-card-foreground">
            {isScanning ? "Scanning..." : showSuccess ? "Tag Detected!" : "Scan RFID Tag"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isScanning 
              ? "Hold your phone near the clothing tag" 
              : showSuccess 
              ? `Tag ID: ${scannedTag}`
              : "Position the RFID tag within the scanning area"}
          </p>
        </div>

        <Button
          data-testid="button-scan"
          size="lg"
          className="w-full h-14"
          onClick={handleScan}
          disabled={isScanning || showSuccess}
        >
          <Camera className="w-5 h-5 mr-2" />
          {isScanning ? "Scanning..." : "Scan Tag"}
        </Button>

        {/* Recently Scanned */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Recently Scanned</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex-shrink-0 w-20 h-20 p-2 flex flex-col items-center justify-center gap-1 hover-elevate active-elevate-2 cursor-pointer">
                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">IMG</span>
                </div>
                <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                  New
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
