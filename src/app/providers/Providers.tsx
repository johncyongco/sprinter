import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import { useUIStore, type ThemeMode } from "@/stores/useUIStore";
import { onAuthStateChange, supabaseUserToProfile } from "@/services/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function ThemeManager() {
  const theme = useUIStore((s) => s.theme);
  const setResolvedTheme = useUIStore((s) => s.setResolvedTheme);

  useEffect(() => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (mode: ThemeMode) => {
      const resolved =
        mode === "system" ? (systemDark.matches ? "dark" : "light") : mode;
      document.documentElement.classList.toggle("dark", resolved === "dark");
      setResolvedTheme(resolved);
    };
    apply(theme);
    const onChange = () => apply(theme);
    systemDark.addEventListener("change", onChange);
    return () => systemDark.removeEventListener("change", onChange);
  }, [theme, setResolvedTheme]);

  return null;
}

function ThemeColor() {
  const resolved = useUIStore((s) => s.resolvedTheme);
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        resolved === "dark" ? "#171614" : "#F6F4EF",
      );
    }
  }, [resolved]);
  return null;
}

function AuthRoot() {
  const user = useUserStore((s) => s.user);
  const onboarded = useUserStore((s) => s.onboarded);
  const setSessionUser = useUserStore((s) => s.setSessionUser);
  const location = window.location.pathname;

  useEffect(() => {
    const unsub = onAuthStateChange((authUser) => {
      if (authUser) {
        setSessionUser(supabaseUserToProfile(authUser), true);
      }
    });
    return unsub;
  }, [setSessionUser]);

  // A real, authenticated account has a provider; the default guest has none.
  const isAuthenticated = Boolean(user?.provider);
  const isAuthPage = location === "/login" || location === "/onboarding";

  useEffect(() => {
    if (isAuthenticated && onboarded && isAuthPage) {
      window.location.assign("/");
    } else if (isAuthenticated && !onboarded && location !== "/onboarding") {
      window.location.assign("/onboarding");
    }
  }, [isAuthenticated, onboarded, isAuthPage, location]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <ThemeManager />
        <ThemeColor />
        <AuthRoot />
        {children}
      </MotionConfig>
    </QueryClientProvider>
  );
}
