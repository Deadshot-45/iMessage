import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SuspenseLoader } from "./components/SuspenseLoader";

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
    <div className="imessage-container">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
