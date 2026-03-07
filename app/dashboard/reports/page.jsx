"use client";
import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import PageGuard from "@/components/PageGuard";
import apiService from "@/lib/api";
import {
  FileText,
  Users,
  UserCheck,
  ClipboardList,
  TrendingUp,
  BarChart2,
  Calendar,
  Loader2,
  FileSpreadsheet,
  FileJson,
} from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { useBranding } from "@/contexts/BrandingContext";

// ─── Curated column definitions per report ────────────────────────────────────
// Each column: { header, key: fn(row) => string }
const REPORT_COLUMNS = {
  clients: [
    { header: "ID",           key: (r) => r.id ?? "" },
    { header: "First Name",   key: (r) => r.first_name ?? "" },
    { header: "Last Name",    key: (r) => r.last_name ?? "" },
    { header: "Email",        key: (r) => r.email ?? "" },
    { header: "Phone",        key: (r) => r.phone ?? "" },
    { header: "Status",       key: (r) => r.status ?? "" },
    { header: "Stage",        key: (r) => r.stage ?? "" },
    { header: "Sessions",     key: (r) => r.session_count ?? r.sessions ?? "" },
    { header: "Created",      key: (r) => fmtDate(r.created_at) },
  ],
  "trainee-applications": [
    { header: "ID",           key: (r) => r.id ?? "" },
    { header: "Full Name",    key: (r) => r.full_name ?? `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() },
    { header: "Email",        key: (r) => r.email ?? "" },
    { header: "Phone",        key: (r) => r.phone ?? "" },
    { header: "Stage",        key: (r) => r.stage ?? "" },
    { header: "Outcome",      key: (r) => r.outcome ?? r.status ?? "" },
    { header: "Applied",      key: (r) => fmtDate(r.created_at) },
  ],
  consultations: [
    { header: "ID",           key: (r) => r.id ?? "" },
    { header: "Client",       key: (r) => r.client_name ?? r.client?.full_name ?? "" },
    { header: "Counsellor",   key: (r) => r.counsellor_name ?? r.counsellor?.full_name ?? "" },
    { header: "Status",       key: (r) => r.status ?? "" },
    { header: "Type",         key: (r) => r.type ?? "" },
    { header: "Scheduled",    key: (r) => fmtDate(r.scheduled_at) },
    { header: "Completed",    key: (r) => fmtDate(r.completed_at) },
    { header: "Notes",        key: (r) => trunc(r.notes ?? "", 60) },
  ],
  tcs: [
    { header: "ID",           key: (r) => r.id ?? "" },
    { header: "Full Name",    key: (r) => r.full_name ?? `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim() },
    { header: "Email",        key: (r) => r.email ?? "" },
    { header: "Phone",        key: (r) => r.phone ?? "" },
    { header: "Status",       key: (r) => r.status ?? "" },
    { header: "Clients",      key: (r) => r.client_count ?? r.clients_count ?? "" },
    { header: "Joined",       key: (r) => fmtDate(r.created_at) },
  ],
  matches: [
    { header: "ID",           key: (r) => r.id ?? "" },
    { header: "Client",       key: (r) => r.client_name ?? r.client?.full_name ?? "" },
    { header: "Status",       key: (r) => r.status ?? "" },
    { header: "Priority",     key: (r) => r.priority ?? "" },
    { header: "Requested",    key: (r) => fmtDate(r.created_at) },
    { header: "Notes",        key: (r) => trunc(r.notes ?? r.reason ?? "", 60) },
  ],
  activity: [
    { header: "ID",           key: (r) => r.id ?? "" },
    { header: "User",         key: (r) => r.user_name ?? r.user?.name ?? "" },
    { header: "Action",       key: (r) => r.action ?? r.type ?? "" },
    { header: "Description",  key: (r) => trunc(r.description ?? r.message ?? "", 80) },
    { header: "IP",           key: (r) => r.ip_address ?? "" },
    { header: "Date",         key: (r) => fmtDate(r.created_at) },
  ],
};

// Fallback: auto-pick top-level string/number fields (max 8)
function autoColumns(row) {
  return Object.entries(row)
    .filter(([, v]) => typeof v !== "object" || v === null)
    .slice(0, 8)
    .map(([k]) => ({
      header: k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      key: (r) => String(r[k] ?? ""),
    }));
}

// ─── Utility helpers ──────────────────────────────────────────────────────────
function fmtDate(val) {
  if (!val) return "";
  try {
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return String(val); }
}
function trunc(str, max = 60) {
  if (!str) return "";
  return String(str).length > max ? String(str).slice(0, max) + "…" : String(str);
}
function toRows(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [data];
}
const todayStr = () => new Date().toISOString().slice(0, 10);
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function getBase64Image(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
    img.src = url;
  });
}

// ─── Export: JSON ─────────────────────────────────────────────────────────────
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, `${filename}_${todayStr()}.json`);
}

// ─── Export: CSV ──────────────────────────────────────────────────────────────
function downloadCSV(data, filename, reportId) {
  const rows = toRows(data);
  if (!rows.length) { toast.warn("No data to export."); return; }
  const cols = REPORT_COLUMNS[reportId] ?? autoColumns(rows[0]);
  const sheetData = [
    cols.map((c) => c.header),
    ...rows.map((r) => cols.map((c) => c.key(r))),
  ];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const buf = XLSX.write(wb, { type: "array", bookType: "csv" });
  triggerDownload(new Blob([buf], { type: "text/csv" }), `${filename}_${todayStr()}.csv`);
}

// ─── Export: PDF ──────────────────────────────────────────────────────────────
async function downloadPDF(data, report, branding) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const rows = toRows(data);
  if (!rows.length) { toast.warn("No data to export."); return; }

  const cols = REPORT_COLUMNS[report.id] ?? autoColumns(rows[0]);

  // Choose orientation based on column count
  const orientation = cols.length > 6 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const BRAND = [111, 29, 86]; // #6f1d56

  // ── Branded header (Letterhead) ──────────────────────────────────────────
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageW, 64, "F");

  // Logo handling
  const logoBase64 = branding.platform_logo_base64;
  if (logoBase64) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(28, 12, 40, 40, 6, 6, "F");
      doc.addImage(logoBase64, 'PNG', 32, 16, 32, 32);
    } catch (e) {
      console.error("Failed to add PDF logo:", e.message || e);
      doc.setFillColor(255, 255, 255);
      doc.circle(48, 32, 16, "F");
      doc.setTextColor(...BRAND);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("VT", 42, 36);
    }
  } else {
    doc.setFillColor(255, 255, 255);
    doc.circle(48, 32, 16, "F");
    doc.setTextColor(...BRAND);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("VT", 42, 36);
  }

  // Company Name (Letterhead title)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(branding.company_name || "Vanquish Training", 80, 28);

  // Report Title (Secondary)
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255, 0.95);
  doc.text(`${report.title} Report`, 80, 42);

  // Custom Header Text + Metadata
  doc.setFontSize(7.5);
  doc.setTextColor(220, 190, 215);
  const headerPrefix = branding.pdf_header_text ? `${branding.pdf_header_text}   ·   ` : "";
  doc.text(
    `${headerPrefix}Generated: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}   ·   Records: ${rows.length}`,
    80, 54
  );

  // Branded "Letterhead" contact info below header (Optional line)
  const contactInfo = [
    branding.company_email,
    branding.company_phone,
    branding.company_website
  ].filter(Boolean).join("  |  ");

  if (contactInfo) {
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 120);
    doc.text(contactInfo, 28, 78);
    // Draw a subtle line below contact info
    doc.setDrawColor(230, 230, 240);
    doc.setLineWidth(0.5);
    doc.line(28, 84, pageW - 28, 84);
  }

  const startY = contactInfo ? 95 : 78;

  // ── Table ─────────────────────────────────────────────────────────────────
  const tableRows = rows.map((r) => cols.map((c) => c.key(r)));

  autoTable(doc, {
    head: [cols.map((c) => c.header)],
    body: tableRows,
    startY: startY,
    margin: { left: 28, right: 28 },
    tableWidth: "auto",
    styles: {
      fontSize: 8,
      cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
      overflow: "linebreak",
      lineColor: [230, 220, 235],
      lineWidth: 0.3,
      textColor: [40, 30, 50],
      font: "helvetica",
    },
    headStyles: {
      fillColor: BRAND,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
    },
    alternateRowStyles: {
      fillColor: [249, 245, 252],
    },
    rowPageBreak: "avoid",
    // Auto-fit column widths proportionally
    columnStyles: Object.fromEntries(
      cols.map((_, i) => [i, { cellWidth: "auto" }])
    ),
    didDrawPage: (hookData) => {
      // ── Footer on every page ──────────────────────────────────────────────
      const ph = doc.internal.pageSize.getHeight();
      doc.setFillColor(248, 244, 252);
      doc.rect(0, ph - 26, pageW, 26, "F");
      doc.setDrawColor(220, 200, 230);
      doc.setLineWidth(0.5);
      doc.line(0, ph - 26, pageW, ph - 26);
      doc.setTextColor(150, 100, 140);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const footerText = branding.pdf_footer_text || `${branding.company_name || 'Vanquish'} — Confidential Report`;
      doc.text(footerText, 28, ph - 15);
      const pageNum = `Page ${hookData.pageNumber}`;
      doc.text(pageNum, pageW - 28, ph - 15, { align: "right" });
    },
  });

  doc.save(`${report.filename}_${todayStr()}.pdf`);
}

// ─── Report definitions ───────────────────────────────────────────────────────
const REPORTS = [
  {
    id: "clients",
    title: "All Clients",
    description: "Full export of all client data including statuses, stages, and session counts.",
    icon: Users,
    color: "from-purple-500 to-purple-700",
    endpoint: "/clients",
    filename: "clients_report",
  },
  {
    id: "trainee-applications",
    title: "Trainee Applications",
    description: "Export of all trainee applications with their current stage and outcome.",
    icon: ClipboardList,
    color: "from-blue-500 to-blue-700",
    endpoint: "/trainee-applications",
    filename: "trainee_applications_report",
  },
  {
    id: "consultations",
    title: "Consultations",
    description: "Summary of all consultation sessions including booked, completed and no-shows.",
    icon: Calendar,
    color: "from-green-500 to-green-700",
    endpoint: "/consultations",
    filename: "consultations_report",
  },
  {
    id: "tcs",
    title: "Training Counsellors",
    description: "Export of all Training Counsellors and their assignment details.",
    icon: UserCheck,
    color: "from-orange-500 to-orange-700",
    endpoint: "/training-counsellors",
    filename: "training_counsellors_report",
  },
  {
    id: "matches",
    title: "Pending Matches",
    description: "List of all clients currently waiting to be matched with a practitioner.",
    icon: TrendingUp,
    color: "from-rose-500 to-rose-700",
    endpoint: "/pending-matches",
    filename: "pending_matches_report",
  },
  {
    id: "activity",
    title: "Activity Log",
    description: "Full audit trail of all admin actions and system events.",
    icon: BarChart2,
    color: "from-slate-500 to-slate-700",
    endpoint: "/activity-logs",
    filename: "activity_log_report",
  },
];

// ─── Format options ───────────────────────────────────────────────────────────
const FORMAT_OPTIONS = [
  { key: "pdf", label: "PDF",  icon: FileText,       color: "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40" },
  { key: "csv", label: "CSV",  icon: FileSpreadsheet, color: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40" },
  { key: "json", label: "JSON", icon: FileJson,       color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40" },
];

// ─── Page component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);
  const { branding } = useBranding();

  const handleDownload = async (report, format) => {
    const key = `${report.id}_${format}`;
    setDownloading(key);
    try {
      const data = await apiService.request(report.endpoint);
      if (format === "json") downloadJSON(data, report.filename);
      else if (format === "csv")  downloadCSV(data, report.filename, report.id);
      else if (format === "pdf")  await downloadPDF(data, report, branding);
      toast.success(`${report.title} exported as ${format.toUpperCase()}.`);
    } catch (err) {
      toast.error(`Failed to export ${report.title}.`);
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const isBusy = (reportId) =>
    FORMAT_OPTIONS.some((f) => downloading === `${reportId}_${f.key}`);

  return (
    <PageGuard menuId="reports-group">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Reports
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                Export system data as PDF, CSV or JSON.
              </p>
            </div>
          </DashboardHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--background)]">

            {/* Format legend */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {FORMAT_OPTIONS.map((f) => (
                <span
                  key={f.key}
                  className={`inline-flex items-center gap-1.5 text-xs font-medium border px-3 py-1.5 rounded-full shadow-sm ${f.color}`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </span>
              ))}
              <span className="text-xs text-gray-400 dark:text-[var(--text-secondary)]">
                — Click a format button on any card below
              </span>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {REPORTS.map((report) => {
                const Icon    = report.icon;
                const busy    = isBusy(report.id);

                return (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-100 dark:border-[var(--card-border)] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                  >
                    {/* Top gradient stripe */}
                    <div className={`h-1.5 bg-gradient-to-r ${report.color}`} />

                    <div className="p-5">
                      {/* Icon + description */}
                      <div className="flex items-start gap-3 mb-5">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${report.color} flex items-center justify-center flex-shrink-0 shadow group-hover:scale-105 transition-transform`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm">
                            {report.title} Report
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      {/* Export buttons */}
                      <div className="flex gap-2">
                        {FORMAT_OPTIONS.map((fmt) => {
                          const fmtKey  = `${report.id}_${fmt.key}`;
                          const fmtBusy = downloading === fmtKey;
                          return (
                            <button
                              key={fmt.key}
                              onClick={() => handleDownload(report, fmt.key)}
                              disabled={busy}
                              title={`Export as ${fmt.label}`}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                                fmtBusy
                                  ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed"
                                  : fmt.color
                              }`}
                            >
                              {fmtBusy
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <fmt.icon className="w-3.5 h-3.5" />
                              }
                              {fmt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info banner */}
            <div className="mt-8 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/40 rounded-xl p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                  Export Formats
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5 leading-relaxed">
                  <strong>PDF</strong> — Clean branded report, ready to print or share. &nbsp;
                  <strong>CSV</strong> — Opens directly in Excel or Google Sheets. &nbsp;
                  <strong>JSON</strong> — Raw structured data for developers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
