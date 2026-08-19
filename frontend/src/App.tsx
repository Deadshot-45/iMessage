import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SuspenseLoader } from "./components/SuspenseLoader";
import { Toaster } from "react-hot-toast";

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
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          className: "!bg-gray-900 !text-white !border !border-gray-700",
        }}
      />
    </>
  );
}

export default App;
