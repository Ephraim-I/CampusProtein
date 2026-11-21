import { useEffect, useState } from "react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import AdminConsole from "./components/AdminConsole";
import VendorDashboard from "./components/VendorDashboard";
import ConsumerDashboard from "./components/ConsumerDashboard";

import { useAuth } from "./context/AuthContext";
import { getToken } from "./services/auth";

type VendorStatus = {
  business_name: string;
  approval_status: string;
  rejection_reason?: string | null;
  location?: string | null;
};

function ApplicationShell() {
  const { user, loading, logout } = useAuth();
  const [vendorStatus, setVendorStatus] = useState<VendorStatus | null>(null);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [vendorError, setVendorError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "vendor") return;

    const loadVendorStatus = async () => {
      setVendorLoading(true);
      setVendorError("");

      try {
        const token = getToken();
        const response = await fetch("/proxy/8000/api/v1/vendors/me/status", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || "Unable to retrieve vendor status.");
        }

        setVendorStatus(await response.json());
      } catch (error) {
        setVendorError(
          error instanceof Error ? error.message : "Unable to load vendor status."
        );
      } finally {
        setVendorLoading(false);
      }
    };

    loadVendorStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <p>Preparing your CampusProtein experience...</p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  if (user.role === "consumer") return <ConsumerDashboard />;

  if (user.role === "admin") return <AdminConsole />;

  if (vendorLoading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-spinner" />
        <p>Checking your vendor application...</p>
      </div>
    );
  }

  if (vendorError) {
    return (
      <div className="role-screen">
        <div className="role-card">
          <div className="role-icon">⚠️</div>
          <h1>Unable to check application</h1>
          <p>{vendorError}</p>
          <button className="role-primary-button" onClick={() => window.location.reload()}>
            Retry
          </button>
          <button className="role-logout-button" onClick={logout}>Sign out</button>
        </div>
      </div>
    );
  }

  if (vendorStatus?.approval_status === "approved") {
    return (
      <VendorDashboard
        businessName={vendorStatus.business_name}
        location={vendorStatus.location}
      />
    );
  }

  const status = vendorStatus?.approval_status ?? "unknown";

  const statusContent: Record<string, { icon: string; title: string; message: string }> = {
    pending: {
      icon: "⏳",
      title: "Application under review",
      message: "Your vendor application has been submitted.",
    },
    approved: {
      icon: "🎉",
      title: "Your vendor account is approved!",
      message: "Your business is now approved.",
    },
    rejected: {
      icon: "📋",
      title: "Application not approved",
      message: vendorStatus?.rejection_reason || "Contact administrator.",
    },
    suspended: {
      icon: "🚫",
      title: "Vendor account suspended",
      message: "Contact administrator.",
    },
  };

  const content = statusContent[status] ?? {
    icon: "❓",
    title: "Unknown status",
    message: "Unable to determine status.",
  };

  return (
    <div className="role-screen">
      <div className="role-card">
        <div className="role-icon">{content.icon}</div>
        <p className="eyebrow">VENDOR PORTAL</p>
        <h1>{content.title}</h1>
        <h3>{vendorStatus?.business_name}</h3>
        <p>{content.message}</p>
        {vendorStatus?.location && (
          <div className="role-location">📍 {vendorStatus.location}</div>
        )}
        <button className="role-logout-button" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}

function App() {
  return <ApplicationShell />;
}

export default App;
