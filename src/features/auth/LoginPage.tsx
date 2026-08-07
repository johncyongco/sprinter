import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { signInWithGoogle } from "@/services/auth";
import { Logo } from "@/components/common/Logo";

export default function LoginPage() {
  const [pending, setPending] = useState<"google" | "guest" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signIn = useUserStore((s) => s.signIn);

  const continueAsGuest = () => {
    setPending("guest");
    signIn();
  };

  const signInGoogle = async () => {
    setPending("google");
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start Google sign-in.");
      setPending(null);
    }
  };

  return (
    <div className="min-h-screen bg-background grid place-items-center px-6 py-16">
      <div
        className="w-full max-w-md space-y-10"
      >
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="space-y-3 text-center">
          <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">Begin here</p>
          <h1 className="font-display text-[2.8rem] leading-[0.98] tracking-[-0.05em]">
            Sit. Write.
            <br />
            Stay a while.
          </h1>
          <p className="text-secondary leading-relaxed">
            Sprinter is a library of stories grown by many hands. Sign in with Google to keep your
            work across devices, or continue as a guest for now.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={signInGoogle}
            disabled={pending !== null}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-5 py-3.5 text-sm font-semibold transition hover:border-accent/40 disabled:opacity-50"
          >
            {pending === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
              </svg>
            )}
            {pending === "google" ? "Opening Google…" : "Sign in with Google"}
          </button>

          <div className="flex items-center gap-4 text-[13px] text-secondary">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={continueAsGuest}
            disabled={pending !== null}
            className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-secondary transition hover:text-primary disabled:opacity-50"
          >
            Continue as guest
          </button>
        </div>

        {error && (
          <p className="rounded-2xl border border-danger/30 bg-danger/5 px-5 py-3 text-center text-[13px] text-danger">
            {error}
          </p>
        )}

        <p className="text-center text-[13px] text-secondary leading-relaxed">
          Continuing means you'll write under a pen name. Sprinter keeps everything kind, everything yours, everything slow.
        </p>
      </div>
    </div>
  );
}
