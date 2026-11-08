import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowRight, FaDoorOpen, FaDoorClosed } from "react-icons/fa";
import Stats from "./Stats";
import { fetchActiveSeason, fetchDashboardStats } from "../api";
import { ChartCard, BarList, ColumnChart, MonthlyLine, SplitMeter, SERIES } from "./charts";
import { categoryLabel } from "../content/story";
import { PageHeader } from "./ui";
import { kk } from "./Kikuyu";
import { useSession } from "./useSession";
import { PERMS, ROLE_LABELS } from "../auth";
import { FaFolderOpen } from "react-icons/fa";

/** Dashboard landing: registration status at a glance + shortcuts to what this role can manage. */
const AdminOverview = ({ sections }) => {
  const { permissions } = useSession();
  const [season, setSeason] = useState(undefined);
  const [charts, setCharts] = useState(null);
  const canSeeStats = permissions.includes(PERMS.STATS);

  useEffect(() => {
    fetchActiveSeason()
      .then((r) => setSeason(r.data))
      .catch(() => setSeason(null));
    if (canSeeStats)
      fetchDashboardStats()
        .then((r) => setCharts(r.data))
        .catch(() => setCharts(null));
  }, [canSeeStats]);

  // Show categories with their Kikuyu names
  const catLabel = (v) => categoryLabel(v, { kikuyu: true });

  const open = season?.accepting_registrations;

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={
          <>
            <span lang="ki">{kk("Wī mūhoro!")}</span> Here’s where things stand.
          </>
        }
      />

      {season !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={`k-cut-strong mb-8 flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between ${
            open ? "bg-bead-green text-cream" : "bg-earth text-cream"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center k-quad-shape bg-cream/15 text-2xl">
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

      {canSeeStats && <Stats />}

      {permissions.includes(PERMS.DOCUMENTS_VIEW) && !canSeeStats && (
        <Link to="/admin/documents" className="k-cut-strong group mt-2 flex items-center gap-5 bg-white p-6 shadow-sm transition hover:-translate-y-1">
          <span className="grid h-14 w-14 shrink-0 place-items-center k-quad-shape bg-kamaru text-2xl text-earth"><FaFolderOpen /></span>
          <span className="flex-1">
            <span className="block font-display text-2xl text-earth">Documents</span>
            <span className="block text-earth-600">Consent forms, judging sheets, rules and programmes for staff and officials.</span>
          </span>
          <FaArrowRight className="text-earth-600 transition group-hover:translate-x-1" />
        </Link>
      )}

      {charts && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Registrations per month" subtitle="Contestant entries over the last 12 months" className="lg:col-span-2">
            <MonthlyLine data={charts.registrations_by_month} caption="Contestant registrations per month" unit=" entries" />
          </ChartCard>
          <ChartCard title="Entries per season" subtitle="● marks the active season">
            <ColumnChart
              data={charts.participants_by_season.map((s) => ({ ...s, label: s.season }))}
              caption="Contestant entries per season"
              mark={(d) => d.active}
            />
          </ChartCard>
          <ChartCard title="Entries per category" subtitle="All seasons">
            <BarList
              data={charts.participants_by_category.map((c) => ({ label: catLabel(c.category), count: c.count }))}
              caption="Contestant entries per category"
            />
          </ChartCard>
          <ChartCard title="Members by role">
            <BarList
              data={charts.users_by_role.map((r) => ({ label: ROLE_LABELS[r.role] || r.role, count: r.count }))}
              caption="Accounts by role"
              color={SERIES.secondary}
            />
          </ChartCard>
          <ChartCard title="Newsletter subscribers" subtitle={`${charts.subscribers.total.toLocaleString()} in total`}>
            <SplitMeter
              caption="Verified and pending newsletter subscribers"
              parts={[
                { label: "Verified", value: charts.subscribers.verified, color: SERIES.primary },
                { label: "Pending", value: charts.subscribers.total - charts.subscribers.verified, color: SERIES.secondary },
              ]}
            />
            <div className="mt-6">
              <MonthlyLine data={charts.subscribers.by_month} caption="New subscribers per month" color={SERIES.secondary} unit=" sign-ups" />
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
