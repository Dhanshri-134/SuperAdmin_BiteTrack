import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import styles from "@/styles/notification.module.css";
import useAuth from "@/hooks/useAuth";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

export default function SuperadminNotifications() {
  useAuth();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [messes, setMesses] = useState([]);
  const [selectedMesses, setSelectedMesses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [editingId, setEditingId] = useState(null);


  const startEdit = (n) => {
  setEditingId(n.id);
  setForm({
    title: n.title,
    message: n.message,
    notification_type: n.notification_type,
    priority: n.priority,
  });
};

const deleteNotification = async (id) => {
  if (!confirm("Delete this notification?")) return;

  await fetch(`/api/superadmin/notifications/delete?id=${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  fetchNotifications();
};


  const [form, setForm] = useState({
    title: "",
    message: "",
    notification_type: "general",
    priority: "normal",
  });

  /* =========================
     Fetch messes
     ========================= */
  const fetchMesses = async () => {
    const res = await fetch("/api/messes/fetch", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMesses(data.messes || []);
  };

  /* =========================
     Fetch notifications
     ========================= */
  const fetchNotifications = async () => {
    const res = await fetch("/api/superadmin/notifications/fetch", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotifications(data.notifications || []);
  };

  useEffect(() => {
    if (token) {
      fetchMesses();
      fetchNotifications();
    }
  }, [token]);

  /* =========================
     Dropdown options
     ========================= */
  const messOptions = messes.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  /* =========================
     Send notification
     ========================= */
  const sendNotification = async () => {
    if (!form.title || !form.message) {
      alert("Title & message required");
      return;
    }

    if (editingId) {
    await fetch("/api/superadmin/notifications/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: editingId,
        ...form,
      }),
    });

    setEditingId(null);
  }
  // CREATE MODE
  else {
    await fetch("/api/superadmin/notifications/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: form.title,
        message: form.message,
        notification_type: form.notification_type,
        priority: form.priority,
        expires_at: null,
        mess_ids: selectedMesses.length > 0 ? selectedMesses : null, 
      }),
    });
}

    // Reset
    setForm({
      title: "",
      message: "",
      notification_type: "general",
      priority: "normal",
    });
    setSelectedMesses([]);

    fetchNotifications();
  };

  return (
    <Layout>
      <h1>Push Notifications</h1>

      {/* Create Notification */}
      <div className={styles.card}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />

        <select
          value={form.notification_type}
          onChange={(e) =>
            setForm({ ...form, notification_type: e.target.value })
          }
        >
          <option value="general">General</option>
          <option value="payment">Payment</option>
          <option value="alert">Alert</option>
          <option value="system">System</option>
        </select>

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <MultiSelectDropdown
          options={messOptions}
          value={selectedMesses}
          onChange={setSelectedMesses}
          placeholder="Select messes (leave empty for all)"
          searchable
        />

                <button onClick={sendNotification}>
  {editingId ? "Update Notification" : "Send Notification"}
</button>
        {/* <button onClick={sendNotification}>Send Notification</button> */}
      </div>

      {/* List */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Mess</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((n) => (
              <tr key={n.id}>
                <td>{n.title}</td>
                <td>{n.message}</td>
                <td>{n.notification_type}</td>
                <td>{n.priority}</td>
                <td>{n.mess_name || "All"}</td>
                <td>{new Date(n.created_at).toLocaleString()}</td>

<td>
  <button
    className={styles.editBtn}
    onClick={() => startEdit(n)}
  >
    Edit
  </button>

  <button
    className={styles.deleteBtn}
    onClick={() => deleteNotification(n.id)}
  >
    Delete
  </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
