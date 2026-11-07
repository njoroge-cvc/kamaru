import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaHourglassHalf } from "react-icons/fa";
import { clearSession, getToken, IDLE_LIMIT_MS, IDLE_WARNING_MS, isIdleExpired, lastActive, rememberMe, touchActivity } from "../auth";

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "wheel"];
const THROTTLE_MS = 15 * 1000; // record activity at most every 15s

/**
 * Signs people out after 30 minutes without activity (in any tab), with a 2-minute warning.
 * Also signs out on return if the browser was closed and the limit passed meanwhile.
 * Skipped for sessions where "Keep me signed in on this device" was ticked.
 */
const IdleLogout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(null); // null = no warning showing
  const lastTouch = useRef(0);

  const signOut = (reason) => {
    setSecondsLeft(null);
    toast.info(reason === "idle" ? "You were signed out after 30 minutes of inactivity." : "You've been signed out.");
    // Private areas send you to log in again (navigate first, so the dashboard's own
    // "not signed in" redirect doesn't replace the inactivity message); public pages stay put
    if (pathname.startsWith("/admin") || pathname.startsWith("/register/participant")) {
      navigate(`/login?${reason === "idle" ? "idle=1&" : ""}next=${encodeURIComponent(pathname)}`);
    }
    clearSession();
  };

  // On first load: the browser may have been closed for longer than the limit
  useEffect(() => {
    if (isIdleExpired()) signOut("idle");
    else if (getToken() && !rememberMe() && !lastActive()) touchActivity(); // sessions from before this feature
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Record activity (throttled) and check the shared clock every few seconds
  useEffect(() => {
    const onActivity = () => {
      if (!getToken() || rememberMe() || secondsLeft !== null) return; // while warning, only the button extends
      const now = Date.now();
      if (now - lastTouch.current > THROTTLE_MS) {
        lastTouch.current = now;
        touchActivity();
      }
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    const tick = setInterval(() => {
      if (!getToken() || rememberMe()) return setSecondsLeft(null);
      const idle = Date.now() - lastActive();
      if (idle >= IDLE_LIMIT_MS) return signOut("idle");
      if (idle >= IDLE_LIMIT_MS - IDLE_WARNING_MS) setSecondsLeft(Math.ceil((IDLE_LIMIT_MS - idle) / 1000));
      else setSecondsLeft(null); // activity in another tab cancels the warning here too
    }, 1000);

    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft !== null, pathname]);

  const stay = () => {
    touchActivity();
    setSecondsLeft(null);
  };

  const mm = Math.floor((secondsLeft || 0) / 60);
  const ss = String((secondsLeft || 0) % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {secondsLeft !== null && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-earth/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="idle-title"
            aria-describedby="idle-desc"
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            className="k-cut-strong w-full max-w-sm bg-cream p-8 text-center shadow-2xl"
          >
            <FaHourglassHalf className="mx-auto text-4xl text-kamaru" />
            <h2 id="idle-title" className="mt-4 font-display text-2xl text-earth">
              Still there?
            </h2>
            <p id="idle-desc" className="mt-2 text-earth-700">
              For your security you'll be signed out in{" "}
              <span className="font-bold tabular-nums text-earth" aria-live="polite">
                {mm}:{ss}
              </span>
              .
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={stay} className="k-btn-primary w-full justify-center py-3" autoFocus>
                Stay signed in
              </button>
              <button onClick={() => signOut("manual")} className="k-btn-ghost w-full justify-center">
                Sign out now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IdleLogout;
