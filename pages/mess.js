import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/table.module.css"; // create separate CSS if needed
import useAuth from "../hooks/useAuth";

export default function MessPage() {
  useAuth(); // ensure user is logged in

  const [messes, setMesses] = useState([]);
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
      console.error("Error fetching messes:", err);
      setError(err.message || "Failed to fetch messes");
    }
  };

  useEffect(() => {
    fetchMesses();
  }, []);

  return (
    <Layout>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>All Messes</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}

          {messes.length === 0 ? (
            <p>No messes found.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Prefix</th>
                    <th>Email</th>
                    <th>Contact Info</th>
                    <th>Location</th>
                    <th>Per Day Rate</th>
                    <th>Active Members</th>
                    <th>Rating</th>
                    <th>Total Reviews</th>
                    <th>Open Time</th>
                    <th>Allowed Leave Days</th>
                  </tr>
                </thead>
                <tbody>
                  {messes.map((m) => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>{m.name}</td>
                      <td>{m.prefix}</td>
                      <td>{m.email || "-"}</td>
                      <td>
                        {m.contact_info
                          ? JSON.stringify(m.contact_info)
                          : "-"}
                      </td>
                      <td>{m.location || "-"}</td>
                      <td>₹{Number(m.per_day_rate || 0).toFixed(2)}</td>
                      <td>{m.active_members || 0}</td>
                      <td>{m.rating || 0}</td>
                      <td>{m.total_reviews || 0}</td>
                      <td>{m.open_time || "-"}</td>
                      <td>{m.allowed_leave_days || 0}</td>
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
