"use client";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw, Users } from "lucide-react";
import apiService from "@/lib/api";

/**
 * "Who's coming": everyone sent a placement acceptance, grouped by the
 * induction date in their email. Filled in automatically when they click
 * the link to accept the placement and confirm attendance, so nobody has to
 * be onboarded or added by hand first.
 */
const COLUMNS = [
  { key: "attending", label: "Attending", Icon: CheckCircle, tone: "text-emerald-700 dark:text-emerald-400", chip: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  { key: "not_attending", label: "Not attending", Icon: XCircle, tone: "text-red-700 dark:text-red-400", chip: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { key: "no_reply", label: "No reply yet", Icon: Clock, tone: "text-gray-600 dark:text-[var(--text-secondary)]", chip: "bg-gray-100 text-gray-700 dark:bg-[var(--hover-bg)] dark:text-[var(--text-secondary)]" },
];

const shortDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";

export default function InductionAttendanceOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = async () => {
    setLoading(true);
    setFailed(false);
    try {
      setData(await apiService.getInductionPlacementAttendees());
    } catch (err) {
      console.error("Induction attendees:", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const groups = data?.groups || [];

  return (
    <section className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-5 mb-6" aria-labelledby="whos-coming">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="whos-coming" className="text-lg font-semibold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#6f1d56]" /> Who&apos;s coming
          </h2>
          <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
            Filled in automatically when someone accepts their placement from the email link and confirms the induction.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-[var(--card-border)] rounded-lg flex items-center gap-2 text-gray-700 dark:text-[var(--text-primary)] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {failed ? (
        <p className="text-sm text-red-700 dark:text-red-400">The list could not be loaded. Press Refresh to try again.</p>
      ) : loading && !data ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">
          No placement acceptances have been sent in the last six months.
        </p>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.induction_date} className="border border-gray-200 dark:border-[var(--card-border)] rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">{g.induction_date}</h3>
                {COLUMNS.map((c) => (
                  <span key={c.key} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.chip}`}>
                    {(g[c.key] || []).length} {c.label.toLowerCase()}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COLUMNS.map(({ key, label, Icon, tone }) => (
                  <div key={key}>
                    <p className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5 ${tone}`}>
                      <Icon className="w-4 h-4" /> {label}
                    </p>
                    {(g[key] || []).length === 0 ? (
                      <p className="text-sm text-gray-400">None</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {g[key].map((p) => (
                          <li key={`${p.type}-${p.id}`} className="text-sm text-gray-800 dark:text-[var(--text-primary)]">
                            <span className="font-medium">{p.name}</span>{" "}
                            <span className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                              {p.type === "Qualified" ? "Qualified" : "Trainee"}
                              {p.responded_at ? ` · replied ${shortDate(p.responded_at)}` : p.sent_at ? ` · sent ${shortDate(p.sent_at)}` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
