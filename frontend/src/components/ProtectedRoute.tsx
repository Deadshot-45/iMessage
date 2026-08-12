import { useAuth } from "@clerk/react";
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";




const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();

  // option 1
  // const { checkAuth, isCheckingAuth, clearAuth } = useAuthStore();

  // option 2 - better for performance
  //const clearAuth = useAuthStore((state) => state.clearAuth);
  //const checkAuth = useAuthStore((state) => state.checkAuth);
  //const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

  useEffect(() => {
    if (!isLoaded) return;

    //  if (isSignedIn) checkAuth();
    //  else clearAuth();
  }, [
    //checkAuth, clearAuth,
    isLoaded,
    isSignedIn,
  ]);

  if (!isSignedIn) return <Navigate to="/auth" replace />;
  return children;
};

export default ProtectedRoute;
