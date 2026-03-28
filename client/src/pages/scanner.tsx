import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle2, Scan, Wifi, WifiOff, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Clothing } from "@shared/schema";

declare global {
  interface Window { NDEFReader?: any; }
}

type ScanState = "idle" | "scanning" | "success" | "found" | "error";

const nfcAvailable = typeof window !== "undefined" && "NDEFReader" in window;

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedTag, setScannedTag] = useState<string | null>(null);
  const [foundItem, setFoundItem] = useState<Clothing | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const nfcRef = useRef<any>(null);

  const { data: clothes } = useQuery<Clothing[]>({ queryKey: ["/api/clothing"] });

  // Clean up NFC reader on unmount
  useEffect(() => () => { nfcRef.current = null; }, []);

  const handleTagDetected = (tagId: string) => {
    setScannedTag(tagId);
    setRecentTags(prev => [tagId, ...prev.filter(t => t !== tagId)].slice(0, 5));
    const existing = clothes?.find(c => c.tagId === tagId);
    if (existing) {
      setFoundItem(existing);
      setScanState("found");
    } else {
      setScanState("success");
      setTimeout(() => setLocation(`/add?tagId=${encodeURIComponent(tagId)}`), 1400);
    }
  };

  // ── Real NFC scan ────────────────────────────────────────────────────────────
  const startNfc = async () => {
    setScanState("scanning");
    setErrorMsg("");
    setScannedTag(null);
    setFoundItem(null);
    try {
      const reader = new window.NDEFReader!();
      nfcRef.current = reader;
      await reader.scan();
      reader.onreadingerror = () => {
        setErrorMsg("Could not read tag — try again.");
        setScanState("error");
      };
      reader.onreading = (e: any) => {
        const tagId = e.serialNumber
          ? e.serialNumber.toUpperCase().replace(/:/g, "-")
          : `NFC-${Date.now()}`;
        handleTagDetected(tagId);
      };
    } catch (err: any) {
      const msg = err?.name === "NotAllowedError"
        ? "NFC permission denied — enable NFC in your phone settings."
        : err?.message || "NFC scan failed.";
      setErrorMsg(msg);
      setScanState("error");
    }
  };

  // ── Demo scan ────────────────────────────────────────────────────────────────
  const startDemo = () => {
    setScanState("scanning");
    setErrorMsg("");
    setScannedTag(null);
    setFoundItem(null);
    setTimeout(() => {
      const mockTag = `TAG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      handleTagDetected(mockTag);
    }, 2000);
  };

  const reset = () => {
    nfcRef.current = null;
    setScanState("idle");
    setScannedTag(null);
    setFoundItem(null);
    setErrorMsg("");
  };

  // ── Derived UI text ──────────────────────────────────────────────────────────
  const headline = () => {
    if (scanState === "scanning") return nfcAvailable ? "Hold tag to phone…" : "Scanning…";
    if (scanState === "success") return "New Tag — Opening form…";
    if (scanState === "found") return "Tag Recognised!";
    if (scanState === "error") return "Scan Failed";
    return nfcAvailable ? "Scan NFC Tag" : "Scan RFID Tag";
  };

  const subtitle = () => {
    if (scanState === "scanning") return nfcAvailable ? "Bring the NFC tag near the top of your phone" : "Simulating RFID scan…";
    if (scanState === "success") return `Tag: ${scannedTag}`;
    if (scanState === "found") return foundItem?.name ?? scannedTag ?? "";
    if (scanState === "error") return errorMsg;
    if (nfcAvailable) return "Uses your phone's NFC reader";
    return "Demo mode — tap to simulate a scan";
  };

  const isActive = scanState === "scanning";
  const isDone = scanState === "success" || scanState === "found";
  const isError = scanState === "error";

  return (
    <div className="flex flex-col h-full bg-background pb-16">

      {/* NFC badge */}
      <div className="flex justify-center pt-4">
        {nfcAvailable ? (
          <Badge className="gap-1.5 px-3 py-1" data-testid="badge-nfc-active">
            <Wifi className="w-3 h-3" /> NFC Active
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1.5 px-3 py-1 text-muted-foreground" data-testid="badge-nfc-demo">
            <WifiOff className="w-3 h-3" /> Demo Mode
          </Badge>
        )}
      </div>

      {/* Scan area */}
      <div className="relative flex-1 flex items-center justify-center p-8">
        <div className={`relative w-full max-w-xs aspect-square rounded-2xl border-2 transition-colors duration-300 ${
          isActive ? "border-primary" :
          isDone   ? "border-primary" :
          isError  ? "border-destructive" :
                     "border-muted-foreground/20"
        }`}>
          {/* Corner brackets */}
          {(["tl","tr","bl","br"] as const).map(c => (
            <div key={c} className={[
              "absolute w-10 h-10 border-4 transition-colors duration-300",
              isError ? "border-destructive" : "border-primary",
              c === "tl" ? "top-0 left-0 border-r-0 border-b-0 rounded-tl-xl" : "",
              c === "tr" ? "top-0 right-0 border-l-0 border-b-0 rounded-tr-xl" : "",
              c === "bl" ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-xl" : "",
              c === "br" ? "bottom-0 right-0 border-l-0 border-t-0 rounded-br-xl" : "",
            ].join(" ")} />
          ))}

          {/* Sweep line while scanning */}
          {isActive && (
            <div className="absolute inset-x-6 h-0.5 bg-primary/60 rounded-full top-0 animate-[sweep_1.6s_ease-in-out_infinite]" />
          )}

          {/* Centre content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">
            {isDone && !foundItem && <CheckCircle2 className="w-20 h-20 text-primary" />}
            {isDone && foundItem && (
              <>
                {foundItem.imageUrl
                  ? <img src={foundItem.imageUrl} alt={foundItem.name} className="w-20 h-20 rounded-xl object-cover" />
                  : <CheckCircle2 className="w-20 h-20 text-primary" />
                }
                <p className="text-sm font-semibold text-center text-foreground leading-tight">{foundItem.name}</p>
              </>
            )}
            {isError && <AlertCircle className="w-20 h-20 text-destructive" />}
            {!isDone && !isError && (
              <Scan className={`w-16 h-16 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground/25"}`} />
            )}
          </div>
        </div>

        {isDone && <div className="absolute inset-0 bg-primary/5 pointer-events-none rounded-2xl" />}
      </div>

      {/* Bottom panel */}
      <div className="bg-card border-t border-card-border p-5 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-card-foreground">{headline()}</h2>
          <p className="text-sm text-muted-foreground">{subtitle()}</p>
        </div>

        {/* Primary action */}
        {!isDone && !isError && !isActive && (
          <Button
            data-testid="button-scan"
            size="lg"
            className="w-full h-14 font-semibold"
            onClick={nfcAvailable ? startNfc : startDemo}
          >
            {nfcAvailable
              ? <><Wifi className="w-5 h-5 mr-2" /> Scan NFC Tag</>
              : <><Camera className="w-5 h-5 mr-2" /> Simulate Scan</>
            }
          </Button>
        )}

        {isActive && (
          <Button data-testid="button-cancel" variant="outline" className="w-full h-14" onClick={reset}>
            Cancel
          </Button>
        )}

        {isError && (
          <Button data-testid="button-retry" className="w-full h-14" onClick={reset}>
            <RefreshCw className="w-5 h-5 mr-2" /> Try Again
          </Button>
        )}

        {/* Found existing item */}
        {scanState === "found" && foundItem && (
          <div className="flex gap-2">
            <Button
              data-testid="button-view-item"
              variant="outline"
              className="flex-1"
              onClick={() => setLocation(`/clothing/${foundItem.id}`)}
            >
              View Item
            </Button>
            <Button
              data-testid="button-scan-again"
              variant="ghost"
              size="icon"
              onClick={reset}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Demo fallback button when NFC is active */}
        {nfcAvailable && scanState === "idle" && (
          <Button
            data-testid="button-demo-scan"
            variant="ghost"
            className="w-full text-muted-foreground text-sm"
            onClick={startDemo}
          >
            Use demo scan instead
          </Button>
        )}

        {/* Recent tags */}
        {recentTags.length > 0 && (
          <div className="pt-1 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent</p>
            <div className="flex flex-wrap gap-2">
              {recentTags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  data-testid={`recent-tag-${tag}`}
                  className="cursor-pointer text-xs"
                  onClick={() => handleTagDetected(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recently scanned placeholder cards */}
        {recentTags.length === 0 && (
          <div className="pt-1 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Recently Scanned</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="flex-shrink-0 w-20 h-20 p-2 flex flex-col items-center justify-center gap-1">
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground/40">—</span>
                  </div>
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">Empty</Badge>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes sweep {
          0%   { top: 0%;   opacity: 1; }
          50%  { top: 95%;  opacity: 0.5; }
          100% { top: 0%;   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
