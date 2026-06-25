"use client";

import { useState, useCallback, useEffect } from "react";
import { usePlaidLink } from "react-plaid-link";
import type { PlaidLinkOnSuccess } from "react-plaid-link";
import { useAuthFetch } from "@/lib/use-auth-fetch";
import { Building2, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface PlaidStatus {
  connected:        boolean;
  institution_name: string | null;
  last_synced_at:   string | null;
}

interface PlaidConnectProps {
  onSyncComplete?: (count: number) => void;
}

export default function PlaidConnect({ onSyncComplete }: PlaidConnectProps) {
  const authFetch                   = useAuthFetch();
  const [linkToken, setLinkToken]   = useState<string | null>(null);
  const [status, setStatus]         = useState<PlaidStatus | null>(null);
  const [syncing, setSyncing]       = useState(false);
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check connection status on mount
  useEffect(() => {
    authFetch("/api/plaid/sync-transactions")
      .then(r => r.json())
      .then((data: PlaidStatus) => setStatus(data))
      .catch(() => setStatus({ connected: false, institution_name: null, last_synced_at: null }));
  }, [authFetch]);

  // Create link token when user wants to connect
  const openLink = useCallback(async () => {
    try {
      const res  = await authFetch("/api/plaid/create-link-token", { method: "POST" });
      const data = await res.json() as { link_token?: string };
      if (data.link_token) setLinkToken(data.link_token);
    } catch {
      showToast("Could not connect to bank. Try again.", "error");
    }
  }, [authFetch]);

  // Plaid Link callbacks
  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    try {
      await authFetch("/api/plaid/exchange-token", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          public_token:     publicToken,
          institution_name: metadata?.institution?.name ?? "Your Bank",
        }),
      });
      // Auto-sync after connecting
      await syncTransactions();
      setStatus(s => ({ ...s!, connected: true, institution_name: metadata?.institution?.name ?? "Your Bank" }));
      showToast(`Connected to ${metadata?.institution?.name ?? "your bank"} successfully!`);
    } catch {
      showToast("Connected but sync failed. Try syncing manually.", "error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch]);

  const { open, ready } = usePlaidLink({
    token:     linkToken ?? "",
    onSuccess,
    onExit:    () => setLinkToken(null),
  });

  // Auto-open when token is ready
  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  const syncTransactions = async () => {
    setSyncing(true);
    try {
      const res  = await authFetch("/api/plaid/sync-transactions", { method: "POST" });
      const data = await res.json() as { synced?: number; error?: string };
      if (data.error) throw new Error(data.error);
      setStatus(s => ({ ...s!, last_synced_at: new Date().toISOString() }));
      showToast(`Synced ${data.synced} transactions from your bank`);
      onSyncComplete?.(data.synced ?? 0);
    } catch (e) {
      showToast((e as Error).message ?? "Sync failed. Try again.", "error");
    } finally {
      setSyncing(false);
    }
  };

  const lastSynced = status?.last_synced_at
    ? new Date(status.last_synced_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)",
          border: `1px solid ${toast.type === "success" ? "rgba(0,255,136,0.4)" : "rgba(255,68,68,0.4)"}`,
          borderRadius: 100, padding: "10px 20px", zIndex: 999,
          display: "flex", alignItems: "center", gap: 8,
          backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {toast.type === "success"
            ? <CheckCircle2 size={14} color="#00FF88" />
            : <AlertCircle size={14} color="#FF4444" />}
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", whiteSpace: "nowrap" }}>
            {toast.msg}
          </span>
        </div>
      )}

      {status === null ? (
        /* Loading state */
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
          <Loader2 size={13} color="var(--text3)" style={{ animation: "spin 1s linear infinite" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>CHECKING...</span>
        </div>
      ) : status.connected ? (
        /* Connected state */
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8 }}>
            <CheckCircle2 size={13} color="var(--em)" />
            <div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--em)", fontWeight: 700 }}>
                {status.institution_name ?? "Bank connected"}
              </span>
              {lastSynced && (
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginLeft: 8 }}>
                  synced {lastSynced}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={syncTransactions}
            disabled={syncing}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: "var(--surface)",
              border: "1px solid var(--border2)", borderRadius: 8,
              fontSize: 11, fontWeight: 700, cursor: syncing ? "not-allowed" : "pointer",
              color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "0.5px",
              transition: "all 0.15s", opacity: syncing ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!syncing) { e.currentTarget.style.borderColor = "var(--em)"; e.currentTarget.style.color = "var(--em)"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
          >
            <RefreshCw size={11} style={{ animation: syncing ? "spin 1s linear infinite" : "none" }} />
            {syncing ? "SYNCING..." : "SYNC"}
          </button>
        </div>
      ) : (
        /* Not connected state */
        <button
          onClick={openLink}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", background: "rgba(0,207,255,0.08)",
            border: "1px solid rgba(0,207,255,0.3)", borderRadius: 8,
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            color: "#00CFFF", fontFamily: "'Space Grotesk', sans-serif",
            transition: "all 0.2s", boxShadow: "0 0 16px rgba(0,207,255,0.1)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,207,255,0.14)"; e.currentTarget.style.boxShadow = "0 0 24px rgba(0,207,255,0.2)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,207,255,0.08)"; e.currentTarget.style.boxShadow = "0 0 16px rgba(0,207,255,0.1)"; }}
        >
          <Building2 size={15} />
          Connect Bank
        </button>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
