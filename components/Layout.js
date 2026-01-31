// import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";
// import styles from "../styles/layout.module.css";
// import { useState } from "react";

// export default function Layout({ children }) {
//   const [collapsed, setCollapsed] = useState(false);

//   return (
//     <div className={styles.container}>
//       <Navbar />
//       <div className={styles.body}>
//         <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
//         <main className={collapsed ? styles.mainCollapsed : styles.main}>
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import styles from "../styles/layout.module.css";
import { useState } from "react";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(true); // 👈 start collapsed on mobile

  return (
    <div className={styles.container}>
      <Navbar onToggleSidebar={() => setCollapsed((v) => !v)} />

      <div className={styles.body}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* ✅ Overlay */}
        {!collapsed && (
          <div
            className={styles.overlay}
            onClick={() => setCollapsed(true)}
          />
        )}

        <main className={collapsed ? styles.mainCollapsed : styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
