import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import Card from "../components/Card";
import styles from "../styles/dashboard.module.css";

export default function Dashboard() {
  const [totalMess, setTotalMess] = useState(0);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  const fetchTotalMess = async () => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const res = await fetch("/api/messes/count", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch mess count");

      setTotalMess(data.total || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const fetchDashboardSummary = async () => {
    const token = getToken();

    try {
      const res = await fetch("/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch summary");

      setTotalReceivable(data.totalReceivable || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };
   const fetchDashboardPaidSummary = async () => {
    const token = getToken();

    try {
      const res = await fetch("/api/dashboard/paidSummary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch summary");

      setTotalPayable(data.totalPayable || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTotalMess();
    fetchDashboardSummary();
    fetchDashboardPaidSummary();
  }, []);

  return (
    <Layout>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1>SuperAdmin Dashboard</h1>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className={styles.cards}>
            <Card title="Total Mess Count" value={totalMess} />
            <Card
              title="Yet To Receive"
              value={`₹${Number(totalReceivable).toLocaleString()}`}
            />
            <Card
              title="Total Received "
              value={`₹${Number(totalPayable).toLocaleString()}`}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}
