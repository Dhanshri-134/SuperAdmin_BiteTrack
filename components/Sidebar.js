import { useState } from "react";
import {
  BarChart3,
  Users,
  ClipboardList,
  Utensils,
  Zap,
  CreditCard,
  Wallet,
  Bell,
  MessageSquare,
  Settings,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "../styles/Sidebar.module.css";
import HardwareScanner from "./HardwareScanner";

export default function Sidebar({ collapsed, setCollapsed }) {
  const [scannerConnected, setScannerConnected] = useState(false);
  const [lastScan, setLastScan] = useState("");
  const [message, setMessage] = useState("");
  const [recentUsers, setRecentUsers] = useState([]);

  const handleConnect = () => {
    setScannerConnected((prev) => !prev);
  };

  const simulateScan = () => {
    if (!scannerConnected) return;
    const fakeCode = "QR-" + Math.floor(Math.random() * 100000);
    setLastScan(fakeCode);
  };

  const handleScan = async (qr) => {
  try {
    const res = await fetch("/api/attendance/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr }),
    });
    const data = await res.json();

    if (res.ok) {
      setMessage(data.message || "Attendance marked successfully");

      // extract single userId from QR
      const parts = qr.split("-");
      const userId = parts.length === 2 ? Number(parts[1]) : null;

      if (userId) {
        const namesRes = await fetch("/api/users/names", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds: [userId] }), // single-element array
        });
        const namesData = await namesRes.json();
        setRecentUsers(namesData.names || []);
      } else {
        setRecentUsers([]);
      }
    } else {
      setMessage(data.error || "Failed to mark attendance");
      setRecentUsers([]);
    }

    fetchAttendance();
  } catch (err) {
    console.error("Error marking attendance:", err);
    setMessage("Something went wrong");
    setRecentUsers([]);
  }
};


  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      {/* Toggle Button */}
      <button className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
      </button>

      {/* Navigation Links */}
      <nav className={styles.nav}>
        <a href="/dashboard">
          <BarChart3 size={20} /> <span>Dashboard</span>
        </a>

        <a href="/mess">
          <Users size={20} /> <span>Messes</span>
        </a>


        <a href="/payments">
          <Zap size={20} /> <span>Payment Collection</span>
        </a>

        <a href="/mess-register">
          <CreditCard size={20} /> <span>Register Mess</span>
        </a>

        <a href="/cash-payments">
          <Wallet size={20} /> <span>Cash Payments</span>
        </a>

        {/* <a href="/notifications">
          <Bell size={20} /> <span>Notifications</span>
        </a> */}

        {/* <a href="/suggestions">
          <MessageSquare size={20} /> <span>Suggestions</span>
        </a>

        <a href="/bookingRequests">
          <Settings size={20} /> <span>Booking Request  </span>
        </a>
        <a href="/DeleteAccRequest">
          <Settings size={20} /> <span>Delete Account  </span>
        </a> */}
      </nav>

      {/* Hardware Scanner */}
      {/* <HardwareScanner onScan={handleScan} /> */}

      {/* Scan Feedback */}
      {/* {message && (
        <div className={styles.messageBanner}>
          <p>{message}</p>
          {recentUsers.length > 0 && (
            <p>Users marked: {recentUsers.join(", ")}</p>
          )}
        </div>
      )} */}
    </aside>
  );
}
