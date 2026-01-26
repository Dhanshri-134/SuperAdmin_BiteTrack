import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/subscription.module.css";
import useAuth from "../hooks/useAuth";

export default function SubscriptionManagement() {
  useAuth();

  const [messes, setMesses] = useState([]);
  const [filter, setFilter] = useState("all");

  // modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedMess, setSelectedMess] = useState(null);
  const [extendDays, setExtendDays] = useState(30);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    const res = await fetch("/api/subscriptions", {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const data = await res.json();
    setMesses(data.messes || []);
  };

  const callSubscriptionApi = async (payload) => {
    const res = await fetch("/api/subscriptions/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Action failed");
  };

  // ACTIONS
  const activateSubscription = async (messId) => {
    if (!confirm("Activate subscription for this mess?")) return;
    await callSubscriptionApi({
      messId,
      action: "activate",
      plan: "monthly",
    });
    fetchSubscriptions();
  };

  const expireSubscription = async (messId) => {
    if (!confirm("Expire this subscription?")) return;
    await callSubscriptionApi({
      messId,
      action: "expire",
    });
    fetchSubscriptions();
  };

  const openExtendModal = (mess) => {
    setSelectedMess(mess);
    setExtendDays(30);
    setShowExtendModal(true);
  };

  const submitExtend = async () => {
    await callSubscriptionApi({
      messId: selectedMess.id,
      action: "extend",
      days: extendDays,
    });
    setShowExtendModal(false);
    fetchSubscriptions();
  };

  const filtered = messes.filter((m) =>
    filter === "all" ? true : m.subscription_status === filter
  );

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Subscription Management</h1>

        {/* Filters */}
        <div className={styles.filters}>
          {["all", "trial", "active", "expired"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`${styles.filterBtn} ${
                filter === s ? styles.activeFilter : ""
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mess</th>
                <th>Status</th>
                <th>Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Days Left</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((m) => {
                const daysLeft = m.subscription_end_date
                  ? Math.ceil(
                      (new Date(m.subscription_end_date) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : "-";

                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>

                    <td>
                      <span
                        className={`${styles.badge} ${
                          m.subscription_status === "trial"
                            ? styles.trial
                            : m.subscription_status === "active"
                            ? styles.active
                            : styles.expired
                        }`}
                      >
                        {m.subscription_status}
                      </span>
                    </td>

                    <td>{m.subscription_plan || "-"}</td>
                    <td>{m.subscription_start_date || "-"}</td>
                    <td>{m.subscription_end_date || "-"}</td>

                    <td
                      className={`${styles.daysLeft} ${
                        typeof daysLeft === "number" && daysLeft <= 5
                          ? styles.daysDanger
                          : styles.daysOk
                      }`}
                    >
                      {daysLeft}
                    </td>

                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.activateBtn}
                          disabled={m.subscription_status === "active"}
                          onClick={() => activateSubscription(m.id)}
                        >
                          Activate
                        </button>

                        <button
                          className={styles.extendBtn}
                          disabled={!m.subscription_end_date}
                          onClick={() => openExtendModal(m)}
                        >
                          Extend
                        </button>

                        <button
                          className={styles.expireBtn}
                          disabled={m.subscription_status === "expired"}
                          onClick={() => expireSubscription(m.id)}
                        >
                          Expire
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 20 }}>
                    No subscriptions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* EXTEND MODAL */}
        {showExtendModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Extend Subscription</h3>
              <p>
                Mess: <b>{selectedMess?.name}</b>
              </p>

              <input
                type="number"
                min="1"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className={styles.modalInput}
              />

              <div className={styles.modalActions}>
                <button
                  className={styles.extendBtn}
                  onClick={submitExtend}
                >
                  Extend
                </button>
                <button
                  className={styles.expireBtn}
                  onClick={() => setShowExtendModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
