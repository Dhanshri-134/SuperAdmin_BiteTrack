import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/payments.module.css";

export default function SuperadminPayments() {
  const [activeTab, setActiveTab] = useState("overview");
  const [payments, setPayments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // superadmin → token only (no messId)
    const token = localStorage.getItem("token");

    Promise.all([
      fetch("/api/payments/overview", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch("/api/payments/history", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([overviewData, historyData]) => {
        setPayments(overviewData || []);
        setHistory(historyData || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const collectDue = async (messId) => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/payments/collect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messId }),
    });

    const data = await res.json();
    alert(data.message || "Collected");

    window.location.reload();
  };

  if (loading) return <Layout>Loading...</Layout>;

  return (
    <Layout>
      <h2>Mess Payments</h2>

      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "overview" ? styles.activeTab : styles.tabsButton}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "history" ? styles.activeTab : styles.tabsButton}
          onClick={() => setActiveTab("history")}
        >
          Payment History
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mess</th>
              <th>Active Users</th>
              <th>Rate</th>
              <th>Amount / Day</th>
              <th>Paid Till</th>
              <th>Unpaid Days</th>
              <th>Total Due</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((m) => (
              <tr key={m.mess_id}>
                <td>{m.mess_name}</td>
                <td>{m.active_users}</td>
                <td>₹{m.rate}</td>
                <td>₹{m.amount_per_day}</td>
                <td>{m.paid_till}</td>
                <td>{m.unpaid_days}</td>
                <td><strong>₹{m.total_due}</strong></td>
                <td>
                  {m.total_due > 0 ? (
                    <button
                      className={styles.payButton}
                      onClick={() => collectDue(m.mess_id)}
                    >
                      Collect
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mess</th>
              <th>From</th>
              <th>To</th>
              <th>Users</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid On</th>
            </tr>
          </thead>

          <tbody>
            {history.map((p) => (
              <tr key={p.id}>
                <td>{p.mess_name}</td>
                <td>{p.from_date}</td>
                <td>{p.to_date}</td>
                <td>{p.active_users}</td>
                <td>₹{p.rate}</td>
                <td><strong>₹{p.amount}</strong></td>
                <td>{p.status}</td>
                <td>
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
