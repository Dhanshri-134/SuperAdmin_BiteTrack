import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/table.module.css";
import useAuth from "../hooks/useAuth";

export default function MessPage() {
  useAuth();

  const [messes, setMesses] = useState([]);
  const [activeTab, setActiveTab] = useState("requests"); // requests | approved
  const [error, setError] = useState("");
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  const fetchMesses = async () => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("/api/messes/fetch", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messes");

      setMesses(data.messes || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch messes");
    }
  };

  useEffect(() => {
    fetchMesses();
  }, []);

  const pendingMesses = messes.filter(
    (m) => m.subscription_status === "pending_approval"
  );

  const approvedMesses = messes.filter(
    (m) => m.subscription_status === "trial"
  );

  const visibleMesses =
    activeTab === "requests" ? pendingMesses : approvedMesses;

    const callAdminApi = async (url, body) => {
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Action failed");
};

const approveMess = async (id) => {
  if (!confirm("Approve this mess?")) return;
  await callAdminApi("/api/messes/actions/approve", { messId: id });
  fetchMesses();
};

const rejectMess = async (id) => {
  if (!confirm("Reject this mess?")) return;
  await callAdminApi("/api/messes/actions/reject", { messId: id });
  fetchMesses();
};

  return (
    <Layout>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>Mess Management</h1>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "requests" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("requests")}
            >
              Mess Requests ({pendingMesses.length})
            </button>

            <button
              className={`${styles.tab} ${
                activeTab === "approved" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("approved")}
            >
              Approved Messes ({approvedMesses.length})
            </button>
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {visibleMesses.length === 0 ? (
            <p>No messes found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Per Day Rate</th>
                    <th>Active Members</th>
                    <th>Rating</th>
                    <th>Allowed Leave Days</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleMesses.map((m) => (
                    <tr key={m.id}>
                      {/* <td>{m.id}</td> */}
                      <td>{m.name}</td>
                      <td>{m.email || "-"}</td>
                      <td>{m.location || "-"}</td>
                      <td>₹{Number(m.per_day_rate || 0).toFixed(2)}</td>
                      <td>{m.active_members || 0}</td>
                      <td>{m.rating || 0}</td>
                      <td>{m.allowed_leave_days || 0}</td>

                      <td>
  {activeTab === "requests" ? (
    <div className={styles.actionGroup}>
      <button
        className={styles.approveBtn}
        onClick={() => approveMess(m.id)}
      >
        Approve
      </button>

      <button
        className={styles.rejectBtn}
        onClick={() => rejectMess(m.id)}
      >
        Reject
      </button>
    </div>

  ) : (
    <button
      className={styles.editBtn}
      onClick={() => router.push(`/messes/edit/${m.id}`)}
    >
      Edit
    </button>
  )}
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
