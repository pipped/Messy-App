import { useState, useEffect, useRef } from "react";
import { Wifi, WifiOff, CheckCircle2, Scan, Keyboard, Usb, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Clothing } from "@shared/schema";

// Extend window for Web NFC
declare global {
  interface Window {
    NDEFReader?: any;
  }
}

type ScanMode = "nfc" | "usb" | "manual";
type ScanState = "idle" | "scanning" | "success" | "error" | "found";

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<ScanMode>("nfc");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedTag, setScannedTag] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [foundItem, setFoundItem] = useState<Clothing | null>(null);
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const nfcReaderRef = useRef<any>(null);
  const usbInputRef = useRef<HTMLInputElement>(null);
  const usbBuffer = useRef("");
  const usbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nfcSupported = typeof window !== "undefined" && "NDEFReader" in window;

  const { data: clothes } = useQuery<Clothing[]>({ queryKey: ["/api/clothing"] });

  // Auto-select best mode
  useEffect(() => {
    if (nfcSupported) setMode("nfc");
    else setMode("usb");
  }, [nfcSupported]);

  // ── Web NFC ─────────────────────────────────────────────────────────────────
  const startNfcScan = async () => {
    if (!nfcSupported) return;
    setScanState("scanning");
    setErrorMsg("");
    setScannedTag(null);
    setFoundItem(null);
    try {
      const reader = new window.NDEFReader!();
      nfcReaderRef.current = reader;
      await reader.scan();
      reader.onreadingerror = () => {
        setErrorMsg("Could not read tag. Try again.");
        setScanState("error");
      };
      reader.onreading = (event: any) => {
        const tagId = event.serialNumber
          ? event.serialNumber.toUpperCase().replace(/:/g, "-")
          : `NFC-${Date.now()}`;
        handleTagDetected(tagId);
      };
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setErrorMsg("NFC permission denied. Enable NFC in your phone's settings.");
      } else {
        setErrorMsg(err.message || "NFC scan failed");
      }
      setScanState("error");
    }
  };

  const stopNfcScan = () => {
    nfcReaderRef.current = null;
    setScanState("idle");
  };

  // ── USB HID (keyboard-input) mode ───────────────────────────────────────────
  // USB RFID readers act as keyboards — they type the tag ID very fast and press Enter.
  // We capture keystrokes into a buffer; if Enter arrives or no keystroke for 100ms,
  // we flush the buffer as the tag ID.
  useEffect(() => {
    if (mode !== "usb") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        if (usbBuffer.current.length >= 4) {
          handleTagDetected(usbBuffer.current.trim().toUpperCase());
          usbBuffer.current = "";
        }
        return;
      }
      // Ignore modifier-only keys
      if (e.key.length === 1) {
        usbBuffer.current += e.key;
        if (usbTimer.current) clearTimeout(usbTimer.current);
        usbTimer.current = setTimeout(() => {
          if (usbBuffer.current.length >= 4) {
            handleTagDetected(usbBuffer.current.trim().toUpperCase());
          }
          usbBuffer.current = "";
        }, 100);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, clothes]);

  // ── Manual input ────────────────────────────────────────────────────────────
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim().toUpperCase();
    if (!trimmed) return;
    handleTagDetected(trimmed);
    setManualInput("");
  };

  // ── Core: tag detected ───────────────────────────────────────────────────────
  const handleTagDetected = (tagId: string) => {
    setScannedTag(tagId);
    setRecentTags(prev => [tagId, ...prev.filter(t => t !== tagId)].slice(0, 5));

    // Look up if tag already exists
    const existing = clothes?.find(c => c.tagId === tagId);
    if (existing) {
      setFoundItem(existing);
      setScanState("found");
    } else {
      setScanState("success");
      setTimeout(() => {
        setLocation(`/add?tagId=${encodeURIComponent(tagId)}`);
      }, 1200);
    }
  };

  const reset = () => {
    setScanState("idle");
    setScannedTag(null);
    setFoundItem(null);
    setErrorMsg("");
    setManualInput("");
    if (mode === "nfc" && nfcReaderRef.current) {
      nfcReaderRef.current = null;
    }
  };

  // ── UI helpers ───────────────────────────────────────────────────────────────
  const statusText = () => {
    if (scanState === "scanning") {
      if (mode === "nfc") return "Hold phone near the NFC tag…";
      return "Swipe tag past reader now";
    }
    if (scanState === "success") return `New tag — opening add form…`;
    if (scanState === "found" && foundItem) return `Found: ${foundItem.name}`;
    if (scanState === "error") return errorMsg;
    if (mode === "nfc") return nfcSupported ? "Tap to start scanning" : "NFC not available on this device";
    if (mode === "usb") return "Ready — swipe an RFID tag";
    return "Enter tag ID below";
  };

  const statusColor = () => {
    if (scanState === "success" || scanState === "found") return "text-primary";
    if (scanState === "error") return "text-destructive";
    if (scanState === "scanning") return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <div className="flex flex-col h-full bg-background pb-16">
      {/* Scan area */}
      <div className="relative flex-1 bg-gradient-to-b from-muted/10 to-muted/30 flex items-center justify-center min-h-64">
        <div className={`relative w-56 h-56 border-2 rounded-xl transition-colors duration-300 ${
          scanState === "scanning" ? "border-primary" :
          scanState === "success" || scanState === "found" ? "border-primary" :
          scanState === "error" ? "border-destructive" :
          "border-muted-foreground/20"
        }`}>
          {/* Corner brackets */}
          {(["tl","tr","bl","br"] as const).map(corner => (
            <div key={corner} className={`absolute w-10 h-10 border-primary border-4
              ${corner === "tl" ? "top-0 left-0 border-r-0 border-b-0 rounded-tl-lg" : ""}
              ${corner === "tr" ? "top-0 right-0 border-l-0 border-b-0 rounded-tr-lg" : ""}
              ${corner === "bl" ? "bottom-0 left-0 border-r-0 border-t-0 rounded-bl-lg" : ""}
              ${corner === "br" ? "bottom-0 right-0 border-l-0 border-t-0 rounded-br-lg" : ""}
              ${(scanState === "error") ? "!border-destructive" : ""}
              ${(scanState === "idle" && mode !== "usb") ? "border-muted-foreground/30" : ""}
            `} />
          ))}

          {/* Scanning line animation */}
          {scanState === "scanning" && (
            <div className="absolute inset-x-4 top-0 h-0.5 bg-primary/70 animate-[scan_1.5s_ease-in-out_infinite]" />
          )}

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            {scanState === "success" && (
              <CheckCircle2 className="w-20 h-20 text-primary" />
            )}
            {scanState === "found" && foundItem && (
              <div className="text-center px-4">
                {foundItem.imageUrl ? (
                  <img src={foundItem.imageUrl} alt={foundItem.name} className="w-16 h-16 rounded-xl object-cover mx-auto mb-2" />
                ) : (
                  <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-1" />
                )}
                <p className="text-xs font-semibold text-foreground truncate">{foundItem.name}</p>
              </div>
            )}
            {scanState === "error" && (
              <AlertCircle className="w-20 h-20 text-destructive" />
            )}
            {(scanState === "idle" || scanState === "scanning") && scanState !== "error" && (
              <Scan className={`w-14 h-14 transition-colors ${scanState === "scanning" ? "text-primary animate-pulse" : "text-muted-foreground/30"}`} />
            )}
          </div>
        </div>

        {/* Success flash */}
        {(scanState === "success" || scanState === "found") && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        )}
      </div>

      {/* Controls panel */}
      <div className="bg-card border-t border-card-border p-5 space-y-4">
        {/* Mode picker */}
        <div className="flex gap-2">
          {nfcSupported && (
            <button
              data-testid="mode-nfc"
              onClick={() => { reset(); setMode("nfc"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                mode === "nfc" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover-elevate"
              }`}
            >
              <Wifi className="w-4 h-4" />
              NFC
            </button>
          )}
          <button
            data-testid="mode-usb"
            onClick={() => { reset(); setMode("usb"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mode === "usb" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover-elevate"
            }`}
          >
            <Usb className="w-4 h-4" />
            USB Reader
          </button>
          <button
            data-testid="mode-manual"
            onClick={() => { reset(); setMode("manual"); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mode === "manual" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover-elevate"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Manual
          </button>
        </div>

        {/* Status */}
        <p className={`text-sm text-center font-medium ${statusColor()}`}>{statusText()}</p>

        {/* NFC action */}
        {mode === "nfc" && (
          <div>
            {scanState === "scanning" ? (
              <Button data-testid="button-stop-scan" variant="outline" className="w-full" onClick={stopNfcScan}>
                Stop Scanning
              </Button>
            ) : (scanState === "success" || scanState === "found" || scanState === "error") ? (
              <Button data-testid="button-scan-again" variant="outline" className="w-full" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Scan Again
              </Button>
            ) : (
              <Button
                data-testid="button-start-nfc"
                className="w-full h-12 font-semibold"
                onClick={startNfcScan}
                disabled={!nfcSupported}
              >
                <Wifi className="w-5 h-5 mr-2" />
                {nfcSupported ? "Start NFC Scan" : "NFC Not Supported"}
              </Button>
            )}
          </div>
        )}

        {/* USB reader — always listening once in USB mode */}
        {mode === "usb" && (
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${
              scanState === "scanning" || scanState === "idle" ? "border-primary/30 bg-primary/5" : "border-border"
            }`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                scanState === "success" || scanState === "found" ? "bg-primary" :
                scanState === "error" ? "bg-destructive" :
                "bg-primary animate-pulse"
              }`} />
              <p className="text-sm text-muted-foreground">
                {scanState === "success" || scanState === "found"
                  ? `Detected: ${scannedTag}`
                  : "Listening for USB RFID reader…"}
              </p>
            </div>
            {(scanState === "success" || scanState === "found" || scanState === "error") && (
              <Button data-testid="button-reset-usb" variant="outline" className="w-full" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Ready for Next Tag
              </Button>
            )}
          </div>
        )}

        {/* Manual input */}
        {mode === "manual" && (
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <Input
              data-testid="input-tag-id"
              ref={usbInputRef}
              placeholder="e.g. TAG-ABC123"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              autoFocus
              autoCapitalize="characters"
              className="flex-1"
            />
            <Button data-testid="button-lookup" type="submit">Look Up</Button>
          </form>
        )}

        {/* Found existing item — show actions */}
        {scanState === "found" && foundItem && (
          <div className="flex gap-2 pt-1">
            <Button
              data-testid="button-view-item"
              variant="outline"
              className="flex-1"
              onClick={() => setLocation(`/clothing/${foundItem.id}`)}
            >
              View Item
            </Button>
            <Button
              data-testid="button-new-item"
              className="flex-1"
              onClick={() => setLocation(`/add?tagId=${encodeURIComponent(scannedTag!)}`)}
            >
              Add New
            </Button>
            <Button data-testid="button-scan-another" variant="ghost" size="icon" onClick={reset}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Recent tags */}
        {recentTags.length > 0 && (
          <div className="pt-2 border-t border-border">
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
      </div>

      <style>{`
        @keyframes scan {
          0%   { transform: translateY(0); opacity: 1; }
          50%  { transform: translateY(216px); opacity: 0.6; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
