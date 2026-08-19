import { lazy, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SuspenseLoader } from "./components/SuspenseLoader";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/useAuthStore";

import "./App.css";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy loaded routes (chunks)
const Home = lazy(() => import("./pages/Home"));
const LockScreen = lazy(() => import("./components/LockScreen"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SuspenseLoader>
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </SuspenseLoader>
    ),
  },
  {
    path: "/auth",
    element: (
      <SuspenseLoader>
        <LockScreen />
      </SuspenseLoader>
    ),
  },
]);

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "var(--win-bg)",
            color: "var(--text-primary)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1px solid var(--win-border)",
            borderRadius: "16px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow:
              "0 10px 30px -5px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05)",
            fontFamily: "var(--font-apple)",
            letterSpacing: "-0.1px",
          },
          success: {
            iconTheme: {
              primary: "#34C759",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#FF3B30",
              secondary: "#fff",
            },
          },
        }}
      />
    </>
  );
}

export default App;
