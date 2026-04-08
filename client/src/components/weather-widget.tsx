import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  MapPin,
  RefreshCw,
  Thermometer,
  AlertCircle,
  LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherState } from "@/hooks/use-weather";

function WeatherIcon({ code, className = "w-5 h-5" }: { code: number; className?: string }) {
  if (code === 0 || code === 1) return <Sun className={className} />;
  if (code <= 3) return <Cloud className={className} />;
  if (code <= 48) return <Wind className={className} />;
  if (code <= 55) return <Droplets className={className} />;
  if (code <= 65 || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
  if (code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow className={className} />;
  return <CloudLightning className={className} />;
}

const seasonLabels: Record<string, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

interface WeatherWidgetProps {
  state: WeatherState;
  onRetry: () => void;
  onApplySeason?: (season: string) => void;
  compact?: boolean;
}

export function WeatherWidget({ state, onRetry, onApplySeason, compact = false }: WeatherWidgetProps) {
  if (state.status === "idle") return null;

  if (state.status === "loading") {
    return (
      <Card className="p-3 flex items-center gap-3" data-testid="weather-loading">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </Card>
    );
  }

  if (state.status === "denied") {
    return (
      <Card className="p-3 flex items-center gap-3" data-testid="weather-denied">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <LocateFixed className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Location access denied</p>
          <p className="text-xs text-muted-foreground">Enable location to see weather</p>
        </div>
        <Button size="icon" variant="ghost" onClick={onRetry} data-testid="button-weather-retry">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="p-3 flex items-center gap-3" data-testid="weather-error">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Weather unavailable</p>
          <p className="text-xs text-muted-foreground truncate">{state.message}</p>
        </div>
        <Button size="icon" variant="ghost" onClick={onRetry} data-testid="button-weather-retry">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </Card>
    );
  }

  const { data } = state;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" data-testid="weather-compact">
        <WeatherIcon code={data.weatherCode} className="w-4 h-4" />
        <span className="text-sm font-medium text-foreground">{data.temperature}°F</span>
        <span className="text-xs">{data.condition}</span>
        <span className="text-xs">·</span>
        <MapPin className="w-3 h-3" />
        <span className="text-xs truncate max-w-[100px]">{data.city}</span>
      </div>
    );
  }

  return (
    <Card className="p-4 space-y-3" data-testid="weather-widget">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <WeatherIcon code={data.weatherCode} className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold text-foreground leading-none">{data.temperature}°F</span>
            <span className="text-sm text-muted-foreground">Feels like {data.feelsLike}°F</span>
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5">{data.condition}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground truncate">{data.city}</p>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRetry}
          data-testid="button-weather-refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-start gap-2">
        <Thermometer className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">{data.recommendation}</p>
      </div>

      {onApplySeason && (
        <Button
          variant="secondary"
          className="w-full"
          data-testid="button-apply-weather-season"
          onClick={() => onApplySeason(data.suggestedSeason)}
        >
          Dress for today — filter by {seasonLabels[data.suggestedSeason]}
        </Button>
      )}
    </Card>
  );
}
