import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileRouter from "./pages/ProfileRouter";
import Wallet from "./pages/Wallet";
import Children from "./pages/Children";
import Bookings from "./pages/Bookings";
import Waitlist from "./pages/Waitlist";
import Ratings from "./pages/Ratings";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRouter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wallet"
        element={
          <ProtectedRoute allowedRoles={["guardian"]}>
            <Wallet />
          </ProtectedRoute>
        }
      />

      <Route
        path="/children"
        element={
          <ProtectedRoute allowedRoles={["guardian"]}>
            <Children />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waitlist"
        element={
          <ProtectedRoute>
            <Waitlist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ratings"
        element={
          <ProtectedRoute allowedRoles={["guardian", "sitter", "admin"]}>
            <Ratings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
