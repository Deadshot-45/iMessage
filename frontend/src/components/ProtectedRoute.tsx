import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "./SuspenseLoader";
import { useAuthStore } from "@/store/useAuthStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const authUser = useAuthStore((state) => state.authUser);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingScreen />;
  if (!authUser) return <Navigate to="/auth" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
