import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Moon, Sun, Monitor, Download, ShieldCheck, ExternalLink } from "lucide-react";
import { getProfile } from "@/services/users";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore, type ThemeMode } from "@/stores/useUIStore";
import { useDraftStore } from "@/stores/useDraftStore";
import { signOutFromSupabase } from "@/services/auth";
import { exportProfileJson } from "@/utils/format";
import { Input, Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: typeof Moon }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

const NOTIFICATION_ROWS: { kind: string; label: string; description: string }[] = [
  { kind: "continuation", label: "Continuations", description: "When someone grows your branch" },
  { kind: "critique", label: "Critiques", description: "When a critique arrives for your story" },
  { kind: "relay", label: "Relay", description: "When the relay reaches you" },
  { kind: "challenge", label: "Challenges", description: "New weekly challenges and deadlines" },
  { kind: "anthology", label: "Anthologies", description: "Monthly anthologies and features" },
];

export function ProfileSettings() {
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  const updateProfile = useUserStore((s) => s.updateProfile);
  const signOut = useUserStore((s) => s.signOut);
  const user = useUserStore((s) => s.user);

  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const notificationPrefs = useUIStore((s) => s.notificationPrefs);
  const toggleNotification = useUIStore((s) => s.toggleNotification);

  const [userEdited, setUserEdited] = useState(false);
  const [form, setForm] = useState<{ penName: string; bio: string; favoriteLine: string }>({
    penName: "",
    bio: "",
    favoriteLine: "",
  });

  const initial = user ?? profile;
  const value = form;

  // Seed the form from the stored profile only once, before the user edits.
  useEffect(() => {
    if (userEdited || !initial) return;
    setForm({
      penName: initial.penName ?? "",
      bio: initial.bio ?? "",
      favoriteLine: initial.favoriteLine ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, userEdited]);

  const edit = (patch: Partial<typeof form>) => {
    setUserEdited(true);
    setForm((f) => ({ ...f, ...patch }));
  };

  const saveProfile = () => {
    updateProfile({
      penName: value.penName.trim(),
      bio: value.bio,
      favoriteLine: value.favoriteLine,
    });
    setSaved(true);
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    window.setTimeout(() => setSaved(false), 1800);
  };

  const handleSignOut = async () => {
    await signOutFromSupabase();
    signOut();
  };

  const exportData = () => {
    const drafts = useDraftStore.getState().drafts;
    const recentlyViewed = useUIStore.getState().recentlyViewed;
    const u = useUserStore.getState().user;
    exportProfileJson({
      exportedAt: new Date().toISOString(),
      user: u,
      drafts,
      recentlyViewed,
    });
  };

  const providers = user?.provider === "google" || user?.provider === "github" ? [user.provider] : [];

  return (
    <div className="space-y-8">
      <section className="space-y-8">
        <h2 className="font-display text-3xl tracking-[-0.03em]">Profile</h2>
        <div className="flex items-center gap-5">
          <Avatar text={initial?.avatar ?? "Y"} size="lg" />
          <div>
            <p className="font-medium">{value.penName || "Your Pen Name"}</p>
            <p className="text-sm text-secondary">{user?.provider ? `Signed in with ${user.provider}` : "Your writing identity"}</p>
          </div>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="pen" className="text-sm font-semibold">Pen name</label>
            <Input id="pen" value={value.penName} onChange={(e) => edit({ penName: e.target.value })} placeholder="Your Pen Name" />
          </div>
          <div className="space-y-2">
            <label htmlFor="line" className="text-sm font-semibold">Favorite line</label>
            <Input id="line" value={value.favoriteLine} onChange={(e) => edit({ favoriteLine: e.target.value })} placeholder="A sentence you carry" />
          </div>
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-semibold">Bio</label>
            <Textarea id="bio" rows={4} value={value.bio} onChange={(e) => edit({ bio: e.target.value })} placeholder="A few sentences about the writer you are becoming." />
          </div>
          <button
            type="button"
            onClick={saveProfile}
            className="rounded-full bg-primary text-background px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]"
          >
            {saved ? "Saved" : "Save changes"}
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl tracking-[-0.03em]">Appearance</h2>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={cn(
                "rounded-2xl border p-5 space-y-2 transition",
                theme === opt.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-secondary hover:text-primary",
              )}
            >
              <opt.icon className="h-5 w-5" strokeWidth={1.5} />
              <p className="text-sm font-semibold">{opt.label}</p>
            </button>
          ))}
        </div>
        <p className="text-[13px] text-secondary">Dark mode honors the same palette — no stark screens, no high-contrast shouting.</p>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl tracking-[-0.03em]">Notifications</h2>
        <p className="text-sm text-secondary -mt-2">The library only speaks when it has good news.</p>
        <div className="space-y-2">
          {NOTIFICATION_ROWS.map((row) => {
            const enabled = notificationPrefs[row.kind] !== false;
            return (
              <button
                key={row.kind}
                type="button"
                onClick={() => toggleNotification(row.kind)}
                aria-label={`${row.label}: ${enabled ? "on" : "off"}`}
                className="flex w-full items-center justify-between gap-6 rounded-2xl border border-border bg-card px-5 py-4 text-left transition hover:border-accent/30"
              >
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <p className="text-[13px] text-secondary">{row.description}</p>
                </div>
                <span
                  className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                    enabled ? "bg-accent" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform",
                      enabled ? "translate-x-[22px]" : "translate-x-0.5",
                    )}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl tracking-[-0.03em]">Connected accounts</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/10 text-gold font-semibold">E</span>
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="text-[13px] text-secondary">you@example.com</p>
              </div>
            </div>
            <span className="rounded-full bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-accent">Connected</span>
          </div>
          {(["Google", "GitHub"] as const).map((p) => {
            const connected = providers.includes(p.toLowerCase() as "google" | "github");
            return (
              <div key={p} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-secondary font-semibold">{p[0]}</span>
                  <p className="text-sm font-semibold">{p}</p>
                </div>
                <button
                  type="button"
                  className={cn(
                    "rounded-full border px-4 py-1.5 text-[13px] font-semibold transition",
                    connected ? "border-border text-secondary" : "border-accent/30 text-accent hover:text-primary",
                  )}
                >
                  {connected ? "Connected" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl tracking-[-0.03em]">Your data</h2>
        <p className="text-sm text-secondary -mt-2">
          Everything you write is yours. Export it any time — it comes with its branches, words, and drafts.
        </p>
        <button
          type="button"
          onClick={exportData}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-secondary transition hover:text-primary"
        >
          <Download className="h-4 w-4" /> Export my writing
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-[13px] text-secondary">
          <ShieldCheck className="h-5 w-5 text-gold shrink-0" strokeWidth={1.5} />
          <p>Your drafts autosave locally and offline. No one reads them until you publish.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl tracking-[-0.03em]">Account</h2>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full border border-danger/30 text-danger px-6 py-3 text-sm font-semibold transition hover:bg-danger/5"
        >
          Sign out
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-[13px] text-secondary transition hover:text-primary"
          onClick={() => window.open("https://github.com/anomalyco/opencode/issues", "_blank")}
        >
          <ExternalLink className="h-3.5 w-3.5" /> Something feels off? Tell us
        </button>
      </section>
    </div>
  );
}
