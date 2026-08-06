import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { Logo } from "@/components/common/Logo";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const signIn = useUserStore((s) => s.signIn);

  const submit = (provider: "email" | "google" | "github") => {
    setPending(provider);
    window.setTimeout(() => signIn(provider), 350);
  };

  return (
    <div className="min-h-screen bg-background grid place-items-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
            Sprinter is a library of stories grown by many hands. Your pen name is enough — the rest can wait.
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) submit("email");
          }}
        >
          <label htmlFor="email" className="block text-sm font-semibold">
            Email
          </label>
          <div className="flex gap-3">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1"
            />
            <button
              type="submit"
              disabled={!email.trim() || pending !== null}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-background transition hover:scale-105 disabled:opacity-40"
              aria-label="Continue with email"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 text-[13px] text-secondary">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => submit("google")}
            disabled={pending !== null}
            className="rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:border-accent/40 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
              </svg>
              Google
            </span>
          </button>
          <button
            type="button"
            onClick={() => submit("github")}
            disabled={pending !== null}
            className="rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:border-accent/40 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.05.77 2.12v3.15c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
              </svg>
              GitHub
            </span>
          </button>
        </div>

        <p className="text-center text-[13px] text-secondary leading-relaxed">
          Continuing means you'll write under a pen name. Sprinter keeps everything kind, everything yours, everything slow.
        </p>
      </motion.div>
    </div>
  );
}
