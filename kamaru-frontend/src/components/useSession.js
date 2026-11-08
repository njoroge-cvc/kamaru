import { useEffect, useState } from "react";
import { getSession, getToken, onSessionChange, saveSession } from "../auth";
import { fetchMe } from "../api";

/** Live session state; re-renders on login, logout or role changes. */
export const useSession = () => {
  const [session, setSession] = useState(getSession);
  useEffect(() => onSessionChange(() => setSession(getSession())), []);
  return session;
};

/** Mount once: refresh role/permissions from the server so role changes apply without re-login. */
export const SessionSync = () => {
  useEffect(() => {
    if (!getSession().token) return;
    fetchMe()
      // Skip if the person signed out meanwhile (e.g. inactivity sign-out on load)
      .then((r) => getToken() && saveSession({ role: r.data.role, roles: r.data.roles, permissions: r.data.permissions, is_admin: r.data.is_admin }))
      .catch(() => {}); // expiry is handled by the API interceptor
  }, []);
  return null;
};
