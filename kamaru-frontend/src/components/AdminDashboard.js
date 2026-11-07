import React, { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaUsers,
  FaImage,
  FaVideo,
  FaUserShield,
  FaCalendarAlt,
  FaCog,
  FaFlag,
  FaHome,
  FaTimes,
  FaExternalLinkAlt,
  FaFeatherAlt,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FaBarsStaggered } from "react-icons/fa6";
import ManageParticipants from "./ManageParticipants";
import ManageGallery from "./ManageGallery";
import ManageVideos from "./ManageVideos";
import ManageUsers from "./ManageUsers";
import ManageEvent from "./ManageEvent";
import ManageSystemImages from "./ManageSystemImages";
import ManageSeasons from "./ManageSeasons";
import ManageBlog from "./ManageBlog";
import AdminOverview from "./AdminOverview";
import { useSession } from "./useSession";
import { clearSession, PERMS, ROLE_LABELS } from "../auth";
import { useSeo } from "../utils/seo";

// Each section declares the permission it needs; the sidebar and routes only show what the role allows.
export const ADMIN_SECTIONS = [
  { path: "seasons", icon: FaFlag, label: "Seasons & Registration", perm: PERMS.SEASONS, element: <ManageSeasons /> },
  { path: "participants", icon: FaUsers, label: "Participants", perm: PERMS.PARTICIPANTS, element: <ManageParticipants isAdmin /> },
  { path: "events", icon: FaCalendarAlt, label: "Events", perm: PERMS.EVENTS, element: <ManageEvent /> },
  { path: "gallery", icon: FaImage, label: "Gallery", perm: PERMS.GALLERY, element: <ManageGallery /> },
  { path: "videos", icon: FaVideo, label: "Videos", perm: PERMS.VIDEOS, element: <ManageVideos /> },
  { path: "blog", icon: FaFeatherAlt, label: "Blog", perm: PERMS.BLOG, element: <ManageBlog /> },
  { path: "system_images", icon: FaCog, label: "Site Images", perm: PERMS.SITE_IMAGES, element: <ManageSystemImages /> },
  { path: "users", icon: FaUserShield, label: "Users & Roles", perm: PERMS.USERS, element: <ManageUsers /> },
];

const SidebarLinks = ({ sections, onNavigate }) => (
  <ul className="space-y-1">
    <li>
      <NavLink
        to="/admin"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `k-quad flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${
            isActive ? "bg-kamaru text-earth" : "text-cream/80 hover:bg-cream/10 hover:text-cream"
          }`
        }
      >
        <FaHome /> Overview
      </NavLink>
    </li>
    {sections.map(({ path, icon: Icon, label }) => (
      <li key={path}>
        <NavLink
          to={`/admin/${path}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            `k-quad flex items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${
              isActive ? "bg-kamaru text-earth" : "text-cream/80 hover:bg-cream/10 hover:text-cream"
            }`
          }
        >
          <Icon /> {label}
        </NavLink>
      </li>
    ))}
  </ul>
);

const AdminDashboard = () => {
  useSeo({ title: "Dashboard", path: "/admin", noindex: true });
  const navigate = useNavigate();
  const { token, role, permissions } = useSession();
  const [drawer, setDrawer] = useState(false);

  const allowed = ADMIN_SECTIONS.filter((s) => permissions.includes(s.perm));
  const isStaff = permissions.includes(PERMS.DASHBOARD);

  useEffect(() => {
    // Skip if another part of the app already moved away (e.g. the inactivity sign-out)
    if (!token && window.location.pathname.startsWith("/admin")) navigate("/login?next=/admin");
  }, [token, navigate]);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  if (!token) return null;

  if (!isStaff) {
    return (
      <div className="mx-auto my-24 max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-earth/5">
        <FaUserShield className="mx-auto text-4xl text-kamaru" />
        <h1 className="mt-4 font-display text-3xl font-bold text-earth">Staff area</h1>
        <p className="mt-2 text-earth-600">
          Your account doesn’t have dashboard access. If you help run the Challenge, ask an administrator to assign you a role.
        </p>
        <Link to="/" className="k-btn-primary mt-6">
          Back to the site
        </Link>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-kamaru-light">Dashboard</p>
        <p className="mt-1 font-display text-2xl font-bold text-cream">Kamaru Admin</p>
        <span className="k-badge mt-3 bg-cream/10 text-cream">
          <FaUserShield /> {ROLE_LABELS[role] || role}
        </span>
      </div>
      <nav className="mt-6 flex-1 overflow-y-auto px-3">
        <SidebarLinks sections={allowed} onNavigate={() => setDrawer(false)} />
      </nav>
      <div className="space-y-2 border-t border-cream/10 p-4">
        <Link to="/" className="flex items-center gap-2 text-sm text-cream/70 hover:text-kamaru-light">
          <FaExternalLinkAlt /> View site
        </Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-2 text-sm text-cream/70 hover:text-kamaru-light">
          <FiLogOut /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] bg-cream">
      {/* Desktop sidebar */}
      <aside className="sticky top-[4.5rem] hidden h-[calc(100vh-4.5rem)] w-64 shrink-0 bg-earth swirl-bg lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-earth/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-[75] w-72 bg-earth swirl-bg lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <button onClick={() => setDrawer(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/10 text-cream" aria-label="Close menu">
                <FaTimes />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <button onClick={() => setDrawer(true)} className="k-btn-dark k-btn-sm mb-4 lg:hidden">
          <FaBarsStaggered /> Menu
        </button>
        <Routes>
          <Route index element={<AdminOverview sections={allowed} />} />
          {allowed.map((s) => (
            <Route key={s.path} path={s.path} element={s.element} />
          ))}
          {/* Unknown or not-permitted section → overview */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;
