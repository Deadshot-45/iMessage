import { useAuth } from "@clerk/react";
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "./SuspenseLoader";
import { useAuthStore } from "@/store/useAuthStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // option 2 - better for performance
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) checkAuth();
    else clearAuth();
  }, [checkAuth, clearAuth, isLoaded, isSignedIn]);

  if (!isLoaded || (isSignedIn && isCheckingAuth)) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/auth" replace />;
  return children;
};

export default ProtectedRoute;
