import { Suspense, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { MobileNav } from "@/components/common/MobileNav";
import { PageLoader } from "@/components/common/PageLoader";
import { ScrollToTop } from "@/components/common/ScrollToTop";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollToTop />
      <Navbar />
      <main className="max-w-[1680px] mx-auto px-10 py-10 max-sm:px-4 max-sm:pt-6 max-sm:pb-40 pb-32 lg:pb-10">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <Suspense fallback={<PageLoader />}>{children}</Suspense>
      </div>
    </div>
  );
}
