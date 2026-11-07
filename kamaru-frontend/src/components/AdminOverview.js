import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaDoorOpen, FaDoorClosed } from "react-icons/fa";
import Stats from "./Stats";
import { fetchActiveSeason } from "../api";
import { PageHeader } from "./ui";
import { useSession } from "./useSession";
import { PERMS } from "../auth";

/** Dashboard landing: registration status at a glance + shortcuts to what this role can manage. */
const AdminOverview = ({ sections }) => {
  const { permissions } = useSession();
  const [season, setSeason] = useState(undefined);

  useEffect(() => {
    fetchActiveSeason()
      .then((r) => setSeason(r.data))
      .catch(() => setSeason(null));
  }, []);

  const open = season?.accepting_registrations;

  return (
    <div>
      <PageHeader eyebrow="Overview" title="Habari! Here’s where things stand." />

      {season !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-8 flex flex-col gap-4 rounded-3xl p-6 md:flex-row md:items-center md:justify-between ${
            open ? "bg-bead-green text-cream" : "bg-earth text-cream"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-cream/15 text-2xl">
              {open ? <FaDoorOpen /> : <FaDoorClosed />}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/70">Participation</p>
              <p className="font-display text-2xl font-bold">
                {season
                  ? open
                    ? `Registration for ${season.name} is OPEN`
                    : `Registration for ${season.name} is closed`
                  : "No active season"}
              </p>
              {season?.registration_closes_at && open && (
                <p className="text-sm text-cream/80">
                  Closes automatically {new Date(season.registration_closes_at).toLocaleString("en-KE")}
                </p>
              )}
            </div>
          </div>
          {permissions.includes(PERMS.SEASONS) && (
            <Link to="/admin/seasons" className="k-btn bg-cream text-earth hover:bg-bead-gold">
              Manage registration <FaArrowRight />
            </Link>
          )}
        </motion.div>
      )}

      <Stats />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ path, icon: Icon, label }, i) => (
          <motion.div key={path} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/admin/${path}`} className="group k-card flex items-center gap-4 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-kamaru/15 text-xl text-kamaru-dark group-hover:bg-kamaru group-hover:text-earth">
                <Icon />
              </span>
              <span className="flex-1 font-semibold text-earth">{label}</span>
              <FaArrowRight className="text-earth-600 transition group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
