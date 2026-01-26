import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import styles from "../../../styles/register.module.css";
import useAuth from "../../../hooks/useAuth";

export default function EditMess() {
  useAuth();

  const router = useRouter();
  const { id } = router.query;

  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");

  const getToken = () => localStorage.getItem("token");

  // 🔹 Fetch existing mess
  useEffect(() => {
    if (!id) return;

    const fetchMess = async () => {
      try {
        const token = getToken();
        const res = await fetch(`/api/messes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch mess");

        setForm({
          ...data.mess,
          contact_info: data.mess.contact_info
            ? JSON.stringify(data.mess.contact_info)
            : "",
          specialties: data.mess.specialties?.join(", ") || "",
          features: data.mess.features?.join(", ") || "",
        });
      } catch (err) {
        console.error(err);
        setMessage("❌ Failed to load mess");
      }
    };

    fetchMess();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 🔹 Update mess
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Saving changes...");

    try {
      const token = getToken();
      const res = await fetch(`/api/messes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setMessage("✅ Mess updated successfully");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update mess");
    }
  };

  if (!form) {
    return (
      <Layout>
        <p style={{ padding: 20 }}>Loading mess details...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Edit Mess</h1>

        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* SAME FORM AS REGISTER */}
            {[
              ["name", "Mess Name"],
              ["prefix", "Prefix"],
              ["email", "Email"],
              ["contact_info", "Contact Info (JSON)"],
              ["location", "Location"],
              ["per_day_rate", "Per Day Rate"],
              ["description", "Description"],
              ["open_time", "Open Time"],
              ["allowed_leave_days", "Allowed Leave Days"],
              ["specialties", "Specialties (comma separated)"],
              ["features", "Features (comma separated)"],
              ["monthly_price", "Monthly Price"],
            ].map(([name, label]) => (
              <div key={name} className={styles.field}>
                <label>{label}</label>
                <input
                  type="text"
                  name={name}
                  value={form[name] ?? ""}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            ))}

            <button type="submit" className={styles.button}>
              Save Changes
            </button>
          </form>

          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    </Layout>
  );
}
