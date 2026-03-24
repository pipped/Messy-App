import { useState } from "react";
import { useTheme, Season } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Sun, Wind, Snowflake } from "lucide-react";

const seasons: { id: Season; label: string; icon: typeof Leaf; gradient: string; description: string }[] = [
  {
    id: "spring",
    label: "Spring",
    icon: Leaf,
    gradient: "from-emerald-400 via-green-300 to-teal-300",
    description: "Fresh & new",
  },
  {
    id: "summer",
    label: "Summer",
    icon: Sun,
    gradient: "from-sky-400 via-blue-300 to-cyan-300",
    description: "Bright & bold",
  },
  {
    id: "fall",
    label: "Fall",
    icon: Wind,
    gradient: "from-orange-400 via-amber-300 to-yellow-300",
    description: "Warm & rich",
  },
  {
    id: "winter",
    label: "Winter",
    icon: Snowflake,
    gradient: "from-indigo-400 via-blue-300 to-slate-300",
    description: "Cool & crisp",
  },
];

const bgGradients: Record<Season, string> = {
  spring: "from-emerald-50 via-green-100 to-teal-50",
  summer: "from-sky-50 via-blue-100 to-cyan-50",
  fall: "from-orange-50 via-amber-100 to-yellow-50",
  winter: "from-indigo-50 via-blue-100 to-slate-50",
};

const darkGradients: Record<Season, string> = {
  spring: "from-emerald-900 via-green-950 to-teal-900",
  summer: "from-sky-900 via-blue-950 to-cyan-900",
  fall: "from-orange-900 via-amber-950 to-yellow-900",
  winter: "from-indigo-900 via-blue-950 to-slate-900",
};

export default function Login() {
  const { login, season, setSeason } = useTheme();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter your name to continue");
      return;
    }
    login(trimmed);
  };

  const selectedSeason = seasons.find(s => s.id === season)!;
  const SeasonIcon = selectedSeason.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradients[season]} dark:bg-none dark:bg-background flex flex-col items-center justify-center p-6`}>
      <div className="w-full max-w-sm space-y-8">
        {/* Logo / Brand */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedSeason.gradient} shadow-lg mb-2`}>
            <SeasonIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground">Messy</h1>
          <p className="text-muted-foreground text-base">Your smart wardrobe, organized.</p>
        </div>

        {/* Season Picker */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">Choose your vibe</p>
          <div className="grid grid-cols-4 gap-2">
            {seasons.map((s) => {
              const Icon = s.icon;
              const isActive = season === s.id;
              return (
                <button
                  key={s.id}
                  data-testid={`season-${s.id}`}
                  onClick={() => setSeason(s.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background/60 text-muted-foreground hover-elevate"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your name</label>
            <Input
              data-testid="input-name"
              type="text"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="h-12 text-base bg-background/80 backdrop-blur-sm"
              autoFocus
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button
            data-testid="button-login"
            type="submit"
            className="w-full h-12 text-base font-semibold"
            size="lg"
          >
            Enter Wardrobe
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Your wardrobe is saved on this device
        </p>
      </div>
    </div>
  );
}
