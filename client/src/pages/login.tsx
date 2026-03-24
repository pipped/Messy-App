import { useState, useRef } from "react";
import { useTheme, Season } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Sun, Wind, Snowflake, Eye, EyeOff, Camera, User } from "lucide-react";

const seasons: { id: Season; label: string; icon: typeof Leaf; gradient: string }[] = [
  { id: "spring", label: "Spring", icon: Leaf, gradient: "from-emerald-400 to-teal-400" },
  { id: "summer", label: "Summer", icon: Sun, gradient: "from-sky-400 to-cyan-400" },
  { id: "fall", label: "Fall", icon: Wind, gradient: "from-orange-400 to-amber-400" },
  { id: "winter", label: "Winter", icon: Snowflake, gradient: "from-indigo-400 to-blue-400" },
];

const bgGradients: Record<Season, string> = {
  spring: "from-emerald-100 via-green-50 to-teal-100",
  summer: "from-sky-100 via-blue-50 to-cyan-100",
  fall: "from-orange-100 via-amber-50 to-yellow-100",
  winter: "from-indigo-100 via-blue-50 to-slate-100",
};

const accentGradients: Record<Season, string> = {
  spring: "from-emerald-400 via-green-300 to-teal-300",
  summer: "from-sky-400 via-blue-300 to-cyan-300",
  fall: "from-orange-400 via-amber-300 to-yellow-300",
  winter: "from-indigo-400 via-blue-300 to-slate-300",
};

export default function Login() {
  const { login, register, season, setSeason, updateProfilePicture } = useTheme();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingPfp, setPendingPfp] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedSeason = seasons.find(s => s.id === season)!;
  const SeasonIcon = selectedSeason.icon;

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPendingPfp(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedUser = username.trim();
    if (!trimmedUser) { setError("Username is required"); return; }
    if (!password) { setError("Password is required"); return; }
    if (mode === "register") {
      if (password.length < 4) { setError("Password must be at least 4 characters"); return; }
      if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    }
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(trimmedUser, password);
      } else {
        await register(trimmedUser, password);
        if (pendingPfp) {
          updateProfilePicture(pendingPfp);
        }
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: "signin" | "register") => {
    setMode(m);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setPendingPfp(null);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradients[season]} flex flex-col items-center justify-center p-5`}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${accentGradients[season]} shadow-lg mb-3`}>
            <SeasonIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Messy</h1>
          <p className="text-sm text-muted-foreground mt-1">Your smart wardrobe, organized.</p>
        </div>

        {/* Card */}
        <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-card-border shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              data-testid="tab-signin"
              onClick={() => switchMode("signin")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === "signin"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              data-testid="tab-register"
              onClick={() => switchMode("register")}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                mode === "register"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Profile picture picker — only on register */}
            {mode === "register" && (
              <div className="flex justify-center">
                <button
                  type="button"
                  data-testid="button-pick-pfp"
                  onClick={() => fileRef.current?.click()}
                  className="relative group"
                >
                  <div className="w-20 h-20 rounded-full bg-muted border-2 border-dashed border-border group-hover:border-primary transition-colors overflow-hidden flex items-center justify-center">
                    {pendingPfp ? (
                      <img src={pendingPfp} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow">
                    <Camera className="w-3 h-3 text-primary-foreground" />
                  </div>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePfpChange}
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</label>
                <Input
                  data-testid="input-username"
                  type="text"
                  placeholder="yourname"
                  value={username}
                  autoCapitalize="none"
                  autoCorrect="off"
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  className="h-11"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Input
                    data-testid="input-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password — only on register */}
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <Input
                      data-testid="input-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive font-medium">{error}</p>
              )}

              <Button
                data-testid="button-submit-auth"
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={loading}
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>
        </div>

        {/* Season picker */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">App theme</p>
          <div className="grid grid-cols-4 gap-2">
            {seasons.map((s) => {
              const Icon = s.icon;
              const isActive = season === s.id;
              return (
                <button
                  key={s.id}
                  data-testid={`season-${s.id}`}
                  onClick={() => setSeason(s.id)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? "border-primary bg-card text-primary shadow-sm"
                      : "border-transparent bg-card/60 text-muted-foreground hover-elevate"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
