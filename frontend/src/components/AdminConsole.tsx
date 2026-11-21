import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Store,
  ShieldCheck,
  LogOut,
  Loader2,
} from "lucide-react";
import "./AdminConsole.css";

const API_BASE = "/proxy/8000/api/v1";

interface PendingVendor {
  id: number;
  user_id: number;
  business_name: string;
  description: string;
  location: string;
  opening_time: string;
  closing_time: string;
  approval_status: string;
  rejection_reason: string | null;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("campusprotein_access_token");

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      if (data.detail) message = data.detail;
    } catch {
      // Keep fallback message.
    }

    throw new Error(message);
  }

  return response.json();
}

export default function AdminConsole() {
  const { logout } = useAuth();

  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectingVendor, setRejectingVendor] =
    useState<PendingVendor | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadVendors = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await apiRequest<PendingVendor[]>("/vendors/pending");
      setVendors(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load pending applications.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const approveVendor = async (vendor: PendingVendor) => {
    const confirmed = window.confirm(
      `Approve ${vendor.business_name} as a CampusProtein vendor?`,
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/vendors/${vendor.id}/approve`, {
        method: "POST",
      });

      setSuccess(`${vendor.business_name} has been approved.`);
      await loadVendors(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Approval failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const rejectVendor = async () => {
    if (!rejectingVendor) return;

    const reason = rejectionReason.trim();

    if (!reason) {
      setError("Please provide a rejection reason.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`/vendors/${rejectingVendor.id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejection_reason: reason }),
      });

      setSuccess(
        `${rejectingVendor.business_name} application rejected.`,
      );

      setRejectingVendor(null);
      setRejectionReason("");

      await loadVendors(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Rejection failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-console">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h1>CampusProtein</h1>
            <p>Administration Console</p>
          </div>
        </div>

        <button className="admin-logout" onClick={logout}>
          <LogOut size={17} />
          Sign out
        </button>
      </header>

      <main className="admin-main">
        <section className="admin-welcome">
          <div>
            <span className="admin-eyebrow">ADMINISTRATION</span>
            <h2>Vendor Applications</h2>
            <p>
              Review businesses requesting access to the CampusProtein
              marketplace.
            </p>
          </div>

          <button
            className="admin-refresh"
            onClick={() => loadVendors(true)}
            disabled={refreshing || submitting}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "admin-spinning" : ""}
            />
            Refresh
          </button>
        </section>

        <section className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">
              <Clock size={20} />
            </div>

            <div>
              <span>Pending applications</span>
              <strong>{vendors.length}</strong>
            </div>
          </div>
        </section>

        {error && (
          <div className="admin-alert admin-alert-error">
            <XCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="admin-alert admin-alert-success">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {loading ? (
          <div className="admin-loading">
            <Loader2 className="admin-spinning" size={30} />
            <p>Loading vendor applications...</p>
          </div>
        ) : vendors.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <CheckCircle size={32} />
            </div>

            <h3>All caught up!</h3>
            <p>There are currently no pending vendor applications.</p>
          </div>
        ) : (
          <div className="admin-vendor-list">
            {vendors.map((vendor) => (
              <article className="admin-vendor-card" key={vendor.id}>
                <div className="admin-vendor-top">
                  <div className="admin-vendor-icon">
                    <Store size={23} />
                  </div>

                  <div className="admin-vendor-heading">
                    <h3>{vendor.business_name}</h3>
                    <span className="admin-pending-badge">
                      <Clock size={13} />
                      Pending review
                    </span>
                  </div>

                  <span className="admin-vendor-id">
                    #{vendor.id}
                  </span>
                </div>

                <div className="admin-vendor-details">
                  <div className="admin-detail">
                    <MapPin size={16} />
                    <span>{vendor.location || "Location not provided"}</span>
                  </div>

                  <div className="admin-detail">
                    <Clock size={16} />
                    <span>
                      {vendor.opening_time || "N/A"} –{" "}
                      {vendor.closing_time || "N/A"}
                    </span>
                  </div>

                  <div className="admin-detail">
                    <span className="admin-user-label">
                      Account ID: {vendor.user_id}
                    </span>
                  </div>
                </div>

                {vendor.description && (
                  <div className="admin-vendor-description">
                    <h4>Business description</h4>
                    <p>{vendor.description}</p>
                  </div>
                )}

                <div className="admin-vendor-actions">
                  <button
                    className="admin-approve-button"
                    onClick={() => approveVendor(vendor)}
                    disabled={submitting}
                  >
                    <CheckCircle size={17} />
                    Approve vendor
                  </button>

                  <button
                    className="admin-reject-button"
                    onClick={() => {
                      setRejectingVendor(vendor);
                      setRejectionReason("");
                      setError("");
                    }}
                    disabled={submitting}
                  >
                    <XCircle size={17} />
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {rejectingVendor && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-icon">
              <XCircle size={24} />
            </div>

            <h2>Reject application</h2>

            <p>
              You are rejecting <strong>{rejectingVendor.business_name}</strong>.
              Provide a reason that can be communicated to the vendor.
            </p>

            <label htmlFor="rejection-reason">
              Rejection reason
            </label>

            <textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this application is being rejected..."
              rows={4}
            />

            <div className="admin-modal-actions">
              <button
                className="admin-modal-cancel"
                onClick={() => {
                  setRejectingVendor(null);
                  setRejectionReason("");
                  setError("");
                }}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                className="admin-modal-confirm"
                onClick={rejectVendor}
                disabled={submitting || !rejectionReason.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="admin-spinning" />
                    Processing...
                  </>
                ) : (
                  "Confirm rejection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
