import { useState } from "react";
import Layout from "../components/Layout";
import styles from "../styles/register.module.css";
import useAuth from "../hooks/useAuth";

export default function RegisterMess() {
  useAuth(); // ensure only logged-in SuperAdmin can access

  const [form, setForm] = useState({
    name: "",
    per_day_rate: 1,
    email: "",
    contact_info: "",
    prefix: "SM",
    description: "",
    location: "",
    rating: 0,
    total_reviews: 0,
    open_time: "",
    active_members: 0,
    specialties: "",
    monthly_price: "₹0",
    features: "",
    allowed_leave_days: 0,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("❌ Not authorized");
        return;
      }

      const res = await fetch("/api/messes/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Mess registered successfully!");
      } else {
        setMessage("❌ " + (data.error || "Failed to register mess"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to register mess");
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Register New Mess</h1>
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Mess Name</label>
                <input type="text" name="name" onChange={handleChange} required className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Prefix</label>
                <input type="text" name="prefix" onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" name="email" onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Contact Info (JSON format)</label>
                <input type="text" name="contact_info" onChange={handleChange} placeholder='{"phone":"123"}' className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Location</label>
                <input type="text" name="location" onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Per Day Rate</label>
                <input type="number" name="per_day_rate" onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Description</label>
                <input type="text" name="description" onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Open Time</label>
                <input type="text" name="open_time" onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Allowed Leave Days</label>
                <input type="number" name="allowed_leave_days" onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Specialties (comma separated)</label>
                <input type="text" name="specialties" onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Features (comma separated)</label>
                <input type="text" name="features" onChange={handleChange} className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Monthly Price</label>
                <input type="text" name="monthly_price" onChange={handleChange} className={styles.input} />
              </div>
            </div>

            <button type="submit" className={styles.button}>Register Mess</button>
          </form>

          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    </Layout>
  );
}
