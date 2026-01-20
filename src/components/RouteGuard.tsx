"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { LoadingOverlay } from "./LoadingOverlay";

// Routes that don't require authentication or onboarding
const PUBLIC_ROUTES = ["/", "/how-to-play"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, initialized, loading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait until auth is initialized
    if (!initialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (isPublicRoute) {
      setIsAuthorized(true);
      return;
    }

    // Protection logic for non-public routes
    if (!user) {
      // Not logged in -> Redirect to home
      setIsAuthorized(false);
      router.push("/");
    } else if (!profile?.username || !profile?.is_onboarded) {
      // Logged in but not fully onboarded -> Redirect to home to show StarterPackModal
      setIsAuthorized(false);
      router.push("/");
    } else {
      // Authorized
      setIsAuthorized(true);
    }
  }, [user, profile, initialized, pathname, router]);

  // Show loading during initialization or if we're not authorized yet on a private route
  if (!initialized || (!isAuthorized && !PUBLIC_ROUTES.includes(pathname))) {
    return <LoadingOverlay message="Verifying access..." />;
  }

  return <>{children}</>;
}
