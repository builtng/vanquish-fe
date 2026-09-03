"use client";
import PageGuard from "@/components/PageGuard";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import apiService from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import ConfirmationModal from "@/components/ConfirmationModal";
import SearchableSelect from "@/components/SearchableSelect";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { formatName, getCounsellorPrefixType } from "@/lib/nameFormatter";
import { formatTimeSlotDisplay } from "@/lib/timeFormatter";
import { computeOverlapSchedule, DAYS_OF_WEEK } from "@/lib/availabilityMatcher";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  ArrowUpDown,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  Video,
  FileText,
  UserCheck,
  Activity,
  Menu,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  ChevronRight,
  MapPin,
  User,
  Star,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Building2,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

const MATCH_STEPS = [
  { label: "Checking availability", icon: Calendar },
  { label: "Evaluating counsellor preferences", icon: UserCheck },
  { label: "Matching clinical issues", icon: Shield },
  { label: "Aligning therapy modality", icon: RefreshCw },
  { label: "Balancing caseload", icon: Star },
];

const STEP_DELAY_MS = 450;

function transformPendingMatchClient(client) {
  const intake = Array.isArray(client.intake_form) ? client.intake_form[0] : (client.intake_form || {});
  return {
    id: client.uuid || client.id,
    uuid: client.uuid || client.id,
    client_id: client.client_id,
    name: client.name,
    age: client.age || null,
    email: client.email,
    phone: client.phone || null,
    serviceType: client.service_type || null,
    genderPreference: client.gender_preference || intake?.gender_preference || "No preference",
    agePreference: client.age_preference || intake?.age_preference || "No preference",
    ethnicityPreference: client.ethnicity_preference || intake?.ethnicity_preference || "No preference",
    orientationPreference: client.orientation_preference || intake?.orientation_preference || "No preference",
    submittedDate: client.submitted_date || null,
    daysWaiting: client.days_waiting || 0,
    waitingText: client.waiting_days_text,
    waitingHours: client.waiting_hours || 0,
    urgency:
      client.urgency ||
      (client.status === "urgent"
        ? "high"
        : client.status === "stuck"
          ? "high"
          : "medium"),
    primaryIssues: client.primary_issues || [],
    preferredModality: client.preferred_modality || null,
    recommendedModality:
      client.consultations?.[0]?.recommended_modality || null,
    availability: client.availability
      ? Object.entries(client.availability).flatMap(([day, slots]) =>
          slots.map(
            (slot) =>
              `${day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()} ${formatTimeSlotDisplay(slot)}`,
          ),
        )
      : [],
    rawAvailability: client.availability || {},
    location: client.address
      ? `${client.address}${client.postcode ? ", " + client.postcode : ""}`
      : null,
    matchScore: null,
    suggestedTCs: [],
    consultantName: client.consultations?.[0]?.tc?.name || null,
    matchedTcName: client.matched_tc?.name || null,
    stage: client.stage,
  };
}

// Client is the fixed variable; practitioners are ranked against its criteria.
function computeSuggestedTCs(client, trainingCounsellors) {
  return trainingCounsellors
    .filter((tc) => {
      const isActive =
        tc.status === "Active" &&
        tc.current_clients < (tc.max_clients || 6);
      const matchesService =
        (client.serviceType === "Low Cost" &&
          tc.counsellor_type === "Trainee") ||
        (["Mid Range", "Counselling & Coaching"].includes(
          client.serviceType,
        ) &&
          tc.counsellor_type === "Qualified");
      return isActive && matchesService;
    })
    .map((tc) => {
      const breakdown = {};
      const flags = [];

      // 1. Availability Overlap (40 points)
      const clientAvail =
        client.rawAvailability && !Array.isArray(client.rawAvailability)
          ? client.rawAvailability
          : !Array.isArray(client.availability)
            ? client.availability || {}
            : {};
      const tcAvail = tc.availability || tc.rawAvailability || {};

      const parsedClientAvail =
        typeof clientAvail === "string"
          ? (() => {
              try {
                return JSON.parse(clientAvail);
              } catch {
                return {};
              }
            })()
          : clientAvail && typeof clientAvail === "object"
            ? clientAvail
            : {};

      const parsedTcAvail =
        typeof tcAvail === "string"
          ? (() => {
              try {
                return JSON.parse(tcAvail);
              } catch {
                return {};
              }
            })()
          : tcAvail && typeof tcAvail === "object"
            ? tcAvail
            : {};

      const overlap = computeOverlapSchedule(parsedClientAvail, parsedTcAvail);
      const hasClientSlots = overlap.totalClientSlots > 0;

      const availPercentage = hasClientSlots ? overlap.overlapPercentage : 100;
      const availabilityScore = (availPercentage / 100) * 40;
      const availMatched = !hasClientSlots || overlap.hasOverlap;
      const availDetail = hasClientSlots
        ? `${overlap.totalOverlapCount} overlapping weekly slot(s) found (${availPercentage}% match)`
        : "No client availability on record to compare";

      breakdown.availability = {
        score: Math.round(availabilityScore),
        max: 40,
        percentage: Math.round(availPercentage),
        matched: availMatched,
        detail: availDetail,
      };

      if (hasClientSlots && !overlap.hasOverlap) {
        flags.push("No overlapping availability with this client");
      }

      // 2. Modality/Specialism Match (20 points)
      const recommendedModality = client.recommendedModality;
      const modalityMatched =
        !!recommendedModality && tc.modality === recommendedModality;
      const modalityScore = modalityMatched
        ? 20
        : !recommendedModality
          ? 12 // Neutral if no recommendation on file
          : 0;
      breakdown.modalityMatch = {
        score: Math.round(modalityScore),
        max: 20,
        percentage: Math.round((modalityScore / 20) * 100),
        matched: modalityMatched || !recommendedModality,
        detail: recommendedModality
          ? modalityMatched
            ? `Offers the recommended modality (${recommendedModality})`
            : `Does not offer the recommended modality (${recommendedModality}); offers ${tc.modality || "N/A"}`
          : "No recommended modality on file for this client",
      };
      if (recommendedModality && !modalityMatched) {
        flags.push(
          `Recommended modality "${recommendedModality}" not offered (practitioner offers ${tc.modality || "N/A"})`,
        );
      }

      // 3. Clinical Issue Match (15 points)
      const clientIssues = Array.isArray(client.primaryIssues)
        ? client.primaryIssues
        : [];
      const tcIssues = Array.isArray(tc.topics_with_experience)
        ? tc.topics_with_experience
        : [];
      const commonIssues = clientIssues.filter((issue) =>
        tcIssues.includes(issue),
      );
      const issueScore =
        clientIssues.length > 0
          ? (commonIssues.length / clientIssues.length) * 15
          : 0;
      breakdown.clinicalIssues = {
        score: Math.round(issueScore),
        max: 15,
        percentage:
          clientIssues.length > 0
            ? Math.round((issueScore / 15) * 100)
            : 100,
        matched: clientIssues.length === 0 || commonIssues.length > 0,
        detail:
          clientIssues.length > 0
            ? `Experienced with ${commonIssues.length}/${clientIssues.length} of the client's primary issues`
            : "No primary issues on record",
      };
      if (clientIssues.length > 0 && commonIssues.length === 0) {
        flags.push(
          `No listed experience with the client's primary issues: ${clientIssues.join(", ")}`,
        );
      }

      // 4. Counsellor Preferences Match (15 points)
      const genderPref = client.genderPreference && client.genderPreference !== "No preference" ? client.genderPreference : null;
      const agePref = client.agePreference && client.agePreference !== "No preference" ? client.agePreference : null;
      const ethnicityPref = client.ethnicityPreference && client.ethnicityPreference !== "No preference" ? client.ethnicityPreference : null;
      const orientationPref = client.orientationPreference && client.orientationPreference !== "No preference" ? client.orientationPreference : null;

      const activePrefs = [];
      if (genderPref) activePrefs.push({ type: "gender", label: "Gender", clientVal: genderPref, tcVal: tc.gender });
      if (agePref) activePrefs.push({ type: "age", label: "Age", clientVal: agePref, tcVal: tc.age });
      if (ethnicityPref) activePrefs.push({ type: "ethnicity", label: "Ethnicity", clientVal: ethnicityPref, tcVal: tc.ethnicity });
      if (orientationPref) activePrefs.push({ type: "orientation", label: "Orientation", clientVal: orientationPref, tcVal: tc.sexual_orientation || tc.sexualOrientation });

      let prefScore = 15;
      const prefDetails = [];
      let matchedCount = 0;

      if (activePrefs.length === 0) {
        prefScore = 15;
        prefDetails.push("No specific demographic preferences specified by client");
      } else {
        const pointsPerPref = 15 / activePrefs.length;
        prefScore = 0;

        activePrefs.forEach((pref) => {
          let isMatch = false;
          if (pref.type === "gender") {
            isMatch = !!pref.tcVal && pref.tcVal.toLowerCase().trim() === pref.clientVal.toLowerCase().trim();
          } else if (pref.type === "age") {
            const tcAge = parseInt(pref.tcVal);
            if (!isNaN(tcAge)) {
              if (pref.clientVal === "20-30" && tcAge >= 20 && tcAge <= 30) isMatch = true;
              else if (pref.clientVal === "30-40" && tcAge >= 30 && tcAge <= 40) isMatch = true;
              else if (pref.clientVal === "40-50" && tcAge >= 40 && tcAge <= 50) isMatch = true;
              else if (pref.clientVal === "50+" && tcAge >= 50) isMatch = true;
            }
          } else if (pref.type === "ethnicity") {
            if (pref.tcVal) {
              const tcEth = pref.tcVal.toLowerCase();
              const clEth = pref.clientVal.toLowerCase();
              isMatch = tcEth.includes(clEth) || clEth.includes(tcEth);
            }
          } else if (pref.type === "orientation") {
            if (pref.tcVal) {
              const tcOri = pref.tcVal.toLowerCase();
              const clOri = pref.clientVal.toLowerCase();
              isMatch = tcOri.includes(clOri) || clOri.includes(tcOri);
            }
          }

          if (isMatch) {
            prefScore += pointsPerPref;
            matchedCount++;
            prefDetails.push(`${pref.label}: Matched (${pref.clientVal})`);
          } else {
            prefDetails.push(`${pref.label}: Mismatched (Client wanted ${pref.clientVal}, practitioner is ${pref.tcVal || "unspecified"})`);
            flags.push(
              `Client requested ${pref.label.toLowerCase()} "${pref.clientVal}" (practitioner is ${pref.tcVal || "unspecified"})`
            );
          }
        });
      }

      breakdown.counsellorPreferences = {
        score: Math.round(prefScore),
        max: 15,
        percentage: Math.round((prefScore / 15) * 100),
        matched: activePrefs.length === 0 || matchedCount === activePrefs.length,
        detail: prefDetails.join(" • "),
      };

      // 5. Caseload Balance (10 points)
      const maxCaseload = tc.max_clients || 6;
      const currentCaseload = tc.current_clients || 0;
      const utilization = maxCaseload > 0 ? currentCaseload / maxCaseload : 1;
      const caseloadScore = (1 - utilization) * 10;
      breakdown.caseloadBalance = {
        score: Math.round(caseloadScore),
        max: 10,
        percentage: Math.round((caseloadScore / 10) * 100),
        matched: utilization < 0.9,
        detail: `${currentCaseload}/${maxCaseload} active clients`,
      };
      if (utilization >= 0.9) {
        flags.push("Practitioner is near full caseload capacity");
      }

      const score =
        breakdown.availability.score +
        breakdown.modalityMatch.score +
        breakdown.clinicalIssues.score +
        breakdown.counsellorPreferences.score +
        breakdown.caseloadBalance.score;

      return {
        id: tc.uuid || tc.id,
        uuid: tc.uuid || tc.id,
        name: tc.name,
        modality: tc.modality || "N/A",
        matchScore: Math.round(score),
        matchBreakdown: breakdown,
        flags,
        currentClients: currentCaseload,
        counsellorType: tc.counsellor_type,
        availability: utilization < 0.8 ? "High" : "Low",
        rawAvailability: tc.availability || {},
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

const BREAKDOWN_LABELS = {
  availability: "Availability",
  modalityMatch: "Modality Match",
  clinicalIssues: "Clinical Issues",
  counsellorPreferences: "Counsellor Preferences",
  caseloadBalance: "Caseload Balance",
};

const PendingMatchRow = ({
  client,
  trainingCounsellors,
  matchResult,
  onMatchComputed,
  setSelectedClient,
  setShowAssignModal,
  setSelectedTC,
  getUrgencyBadge,
  formatName,
  onMarkReady,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [markReadyLoading, setMarkReadyLoading] = useState(false);
  const [runningMatch, setRunningMatch] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const handleRunMatch = async () => {
    setRunningMatch(true);
    for (let i = 0; i < MATCH_STEPS.length; i++) {
      setStepIndex(i);
      await new Promise((resolve) => setTimeout(resolve, STEP_DELAY_MS));
    }
    const results = computeSuggestedTCs(client, trainingCounsellors);
    onMatchComputed(results);
    setRunningMatch(false);
  };

  const openAssignModal = (tc) => {
    setSelectedClient({ ...client, suggestedTCs: matchResult || [] });
    if (tc) {
      const fullTC = trainingCounsellors.find(
        (t) => t.id === tc.id || t.uuid === tc.id || t.uuid === tc.uuid,
      );
      setSelectedTC({
        ...tc,
        rawAvailability: fullTC?.availability || tc.rawAvailability || {},
      });
    } else {
      setSelectedTC(null);
    }
    setShowAssignModal(true);
  };

  const canSelfSelect =
    client.serviceType &&
    client.serviceType !== "Low Cost" &&
    client.stage === "Consultation Completed";
  const isReadyForSelection = client.stage === "Ready to Choose Counsellor";

  return (
    <React.Fragment>
      <tr
        className={`hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] transition-colors cursor-pointer ${isExpanded ? "bg-gray-50 dark:bg-[var(--hover-bg)]" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--purple-bg)] flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-[var(--purple-primary)]" />
            </div>
            <div>
              <Link
                href={`/dashboard/client-details/${client.uuid || client.id}`}
                className="font-bold text-gray-900 dark:text-[var(--text-primary)] hover:text-[var(--purple-primary)] block line-clamp-1"
                onClick={(e) => e.stopPropagation()}
              >
                {client.name}, {client.age}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] line-clamp-1">
                  {client.email}
                </p>
                {client.stage === "Consultation Booked" && (
                  <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded uppercase">
                    Upcoming Consultation
                  </span>
                )}
                {client.stage === "Consultation Completed" && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold rounded uppercase">
                    Consultation Done
                  </span>
                )}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 text-xs font-medium rounded-full whitespace-nowrap">
            {client.serviceType}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-[var(--text-primary)]">
              {client.waitingText || `${client.daysWaiting} days`}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(client.urgency)} whitespace-nowrap`}
          >
            {client.urgency.toUpperCase()}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openAssignModal(null);
              }}
              className="px-3 py-1.5 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <UserCheck className="w-4 h-4" />
              Assign
            </button>
            {canSelfSelect && isReadyForSelection && (
              <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full whitespace-nowrap">
                Awaiting client selection
              </span>
            )}
            {canSelfSelect && !isReadyForSelection && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  setMarkReadyLoading(true);
                  try {
                    await onMarkReady(client);
                  } finally {
                    setMarkReadyLoading(false);
                  }
                }}
                disabled={markReadyLoading}
                className="px-3 py-1.5 border border-[var(--border-color)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {markReadyLoading ? "Sending…" : "Let Client Choose"}
              </button>
            )}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50/30 dark:bg-[var(--card-bg)]/20">
          <td
            colSpan="5"
            className="px-6 py-4 border-b border-gray-100 dark:border-[var(--card-border)]/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">
                    Client Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      <Phone className="w-3.5 h-3.5 opacity-70" />{" "}
                      {client.phone || (
                        <span className="italic opacity-60">No phone</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      <MapPin className="w-3.5 h-3.5 opacity-70" />{" "}
                      {client.location || (
                        <span className="italic opacity-60">No location</span>
                      )}
                    </div>
                    {client.consultantName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        <UserCheck className="w-3.5 h-3.5 opacity-70 text-[var(--purple-primary)]" />{" "}
                        <span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">
                            Consulted by:{" "}
                          </span>
                          <span className="font-medium text-[var(--purple-primary)]">
                            {formatName(client.consultantName, "tc")}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">
                    Preferences & Issues
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {client.preferredModality && (
                      <span className="px-2 py-0.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] text-[10px] rounded-full font-medium border border-[var(--purple-border)]">
                        Modality: {client.preferredModality}
                      </span>
                    )}
                    {client.genderPreference && client.genderPreference !== "No preference" && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium border border-purple-200">
                        Gender: {client.genderPreference}
                      </span>
                    )}
                    {client.agePreference && client.agePreference !== "No preference" && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium border border-purple-200">
                        Age: {client.agePreference}
                      </span>
                    )}
                    {client.ethnicityPreference && client.ethnicityPreference !== "No preference" && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium border border-purple-200">
                        Ethnicity: {client.ethnicityPreference}
                      </span>
                    )}
                    {client.orientationPreference && client.orientationPreference !== "No preference" && (
                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded-full font-medium border border-purple-200">
                        Orientation: {client.orientationPreference}
                      </span>
                    )}
                    {client.primaryIssues.map((issue) => (
                      <span
                        key={issue}
                        className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-[10px] rounded-full font-medium border border-red-100 dark:border-red-900/30"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2">
                    Availability
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] line-clamp-2">
                    {client.availability.join(", ")}
                  </p>
                </div>
              </div>

              {/* Practitioner Match */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                    Practitioner Match
                  </h4>
                  {matchResult && !runningMatch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunMatch();
                      }}
                      className="text-[10px] text-[var(--purple-primary)] font-medium flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Re-run match
                    </button>
                  )}
                </div>

                {!matchResult && !runningMatch && (
                  <div className="flex flex-col items-center justify-center py-6 border border-dashed border-gray-200 dark:border-[var(--card-border)] rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-3 text-center max-w-xs">
                      Client is fixed. Run the algorithm to rank
                      practitioners against their criteria.
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunMatch();
                      }}
                      className="px-4 py-2 bg-[var(--purple-primary)] text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Run Match
                    </button>
                  </div>
                )}

                {runningMatch && (
                  <div className="py-4 px-4 border border-gray-200 dark:border-[var(--card-border)] rounded-xl bg-white dark:bg-[var(--card-bg)] space-y-2.5">
                    {MATCH_STEPS.map((step, idx) => {
                      const StepIcon = step.icon;
                      const state =
                        idx < stepIndex
                          ? "done"
                          : idx === stepIndex
                            ? "active"
                            : "pending";
                      return (
                        <div
                          key={step.label}
                          className="flex items-center gap-2.5"
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              state === "done"
                                ? "bg-green-100 text-green-600"
                                : state === "active"
                                  ? "bg-[var(--purple-bg)] text-[var(--purple-primary)]"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600"
                            }`}
                          >
                            {state === "done" ? (
                              <CheckCircle className="w-3.5 h-3.5" />
                            ) : state === "active" ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <StepIcon className="w-3 h-3" />
                            )}
                          </div>
                          <span
                            className={`text-xs ${
                              state === "pending"
                                ? "text-gray-400 dark:text-[var(--text-tertiary)]"
                                : "text-gray-700 dark:text-[var(--text-primary)] font-medium"
                            }`}
                          >
                            {step.label}...
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {matchResult && !runningMatch && (
                  <div className="grid grid-cols-1 gap-3">
                    {matchResult.map((tc) => (
                      <div
                        key={tc.id}
                        className="bg-white dark:bg-[var(--card-bg)] border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Link
                                href={`/dashboard/training-counsellors/details/${tc.uuid || tc.id}`}
                                className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-sm hover:text-[var(--purple-primary)] transition-colors truncate block"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {formatName(tc.name, "tc")}
                              </Link>
                              <span className="flex-shrink-0 px-1.5 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[10px] rounded-full font-bold border border-green-100 dark:border-green-900/30">
                                {tc.matchScore}%
                              </span>
                              {tc.flags.length > 0 && (
                                <span className="flex-shrink-0 flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[10px] rounded-full font-bold border border-amber-100 dark:border-amber-900/30">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  {tc.flags.length} flag
                                  {tc.flags.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-[var(--text-tertiary)] truncate">
                              {tc.modality} • {tc.currentClients} clients
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignModal(tc);
                            }}
                            className="flex-shrink-0 px-3 py-1.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] group-hover:bg-[var(--purple-primary)] group-hover:text-white rounded-lg text-[11px] font-bold transition-all"
                          >
                            Assign
                          </button>
                        </div>

                        {/* Why this practitioner: matched vs unmatched criteria */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[var(--card-border)] grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(tc.matchBreakdown).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                title={value.detail}
                                className={`px-2 py-1.5 rounded-lg border text-[10px] leading-tight ${
                                  value.matched
                                    ? "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400"
                                    : "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400"
                                }`}
                              >
                                <div className="flex items-center gap-1 font-bold">
                                  {value.matched ? (
                                    <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" />
                                  ) : (
                                    <X className="w-2.5 h-2.5 flex-shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {BREAKDOWN_LABELS[key] || key}
                                  </span>
                                </div>
                                <p className="opacity-80 mt-0.5">
                                  {value.percentage}%
                                </p>
                              </div>
                            ),
                          )}
                        </div>

                        {tc.flags.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {tc.flags.map((flag) => (
                              <li
                                key={flag}
                                className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-400"
                              >
                                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <span>{flag}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    {matchResult.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 border border-dashed border-gray-200 dark:border-[var(--card-border)] rounded-xl opacity-60">
                        <RefreshCw className="w-5 h-5 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 italic text-center">
                          No eligible practitioners matched this client's
                          criteria. <br />
                          Click Assign to browse all practitioners.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

export default function PendingMatchesPage() {
  const pathname = usePathname();
  const { success, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTC, setSelectedTC] = useState(null);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trainingCounsellors, setTrainingCounsellors] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [matchesByClient, setMatchesByClient] = useState({});

  // Pro Modal Slot Scheduling State
  const [selectedSlot, setSelectedSlot] = useState(null); // { day: 'Monday', slot: '10am-1050am', label: '10:00 AM - 10:50 AM' }
  const [tcSlotBookings, setTcSlotBookings] = useState({});
  const [loadingSlotBookings, setLoadingSlotBookings] = useState(false);
  const [slotFilter, setSlotFilter] = useState("all"); // 'all' | 'overlap_only'
  const [activeDayTab, setActiveDayTab] = useState("all"); // 'all' | 'monday' | 'tuesday' | ...

  // Calculate Overlap between client availability and selected TC availability
  const overlapSchedule = useMemo(() => {
    if (!selectedClient || !selectedTC) return null;
    const clientAvail = selectedClient.rawAvailability || {};
    const tcAvail = selectedTC.rawAvailability || selectedTC.availability || {};
    return computeOverlapSchedule(
      clientAvail,
      typeof tcAvail === "object" ? tcAvail : {},
    );
  }, [selectedClient, selectedTC]);

  // Fetch TC slot bookings / caseload when a TC is selected in the modal
  useEffect(() => {
    if (selectedTC && showAssignModal) {
      const fetchBookings = async () => {
        try {
          setLoadingSlotBookings(true);
          const data = await apiService.getTCSlotBookings(
            selectedTC.uuid || selectedTC.id,
          );
          setTcSlotBookings(data?.slots || {});
        } catch (e) {
          console.error("Failed to load TC slot bookings:", e);
          setTcSlotBookings({});
        } finally {
          setLoadingSlotBookings(false);
        }
      };
      fetchBookings();
    } else {
      setTcSlotBookings({});
      setSelectedSlot(null);
      setSlotFilter("all");
      setActiveDayTab("all");
    }
  }, [selectedTC, showAssignModal]);

  const handleMarkReady = async (client) => {
    try {
      await apiService.markReadyForCounsellorSelection(client.uuid);
      success(`${client.name} can now choose their own practitioner.`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showError(err.message || "Failed to send counsellor selection link.");
    }
  };

  // Fetch pending matches from API
  useEffect(() => {
    const fetchPendingMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (filterService !== "all") params.service_type = filterService;
        if (filterUrgency !== "all") params.urgency = filterUrgency;
        if (sortBy) params.sort_by = sortBy;

        const data = await apiService.getPendingMatches(params);

        setPendingMatches(data.map(transformPendingMatchClient));
        setMatchesByClient({});
      } catch (err) {
        console.error("Error fetching pending matches:", err);
        const errorMessage =
          "Failed to load pending matches. Please try again.";
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingMatches();
  }, [searchTerm, filterService, filterUrgency, sortBy, refreshKey]);

  // Fetch training counsellors so a match can be run on demand per client
  useEffect(() => {
    const fetchTCs = async () => {
      try {
        const data = await apiService.getTrainingCounsellors();
        setTrainingCounsellors(data);
      } catch (err) {
        console.error("Error fetching training counsellors:", err);
      }
    };

    fetchTCs();
  }, []);

  // Mock Pending Match Clients (removed)

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "high":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-1 ring-inset ring-red-600/20 dark:ring-red-500/30";
      case "medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30";
      case "low":
        return "bg-[var(--success-bg)] text-[var(--success-primary)] border border-[var(--success-border)]";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-500/30";
    }
  };

  const getAvailabilityBadge = (availability) => {
    switch (availability) {
      case "High":
        return "bg-[var(--success-bg)] text-[var(--success-primary)] border border-[var(--success-border)]";
      case "Medium":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 ring-1 ring-inset ring-yellow-600/20 dark:ring-yellow-500/30";
      case "Low":
        return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 ring-1 ring-inset ring-orange-600/20 dark:ring-orange-500/30";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 ring-1 ring-inset ring-gray-600/20 dark:ring-gray-500/30";
    }
  };

  const filteredMatches = pendingMatches
    .filter((match) => {
      const matchesSearch =
        match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesService =
        filterService === "all" || match.serviceType === filterService;
      const matchesUrgency =
        filterUrgency === "all" || match.urgency === filterUrgency;
      return matchesSearch && matchesService && matchesUrgency;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return a.waitingHours - b.waitingHours;
      } else if (sortBy === "urgency") {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      } else if (sortBy === "daysWaiting") {
        return b.waitingHours - a.waitingHours;
      } else if (sortBy === "id") {
        return b.client_id?.localeCompare(a.client_id, undefined, {
          numeric: true,
        });
      } else if (sortBy === "name") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  const stats = {
    total: pendingMatches.length,
    highUrgency: pendingMatches.filter((m) => m.urgency === "high").length,
    waitingOver3Days: pendingMatches.filter((m) => m.daysWaiting >= 3).length,
    lowCost: pendingMatches.filter((m) => m.serviceType === "Low Cost").length,
  };

  return (
    <PageGuard menuId="pending-matches">
      <DashboardLayout>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader
            actions={
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    const params = {};
                    if (searchTerm) params.search = searchTerm;
                    if (filterService !== "all")
                      params.service_type = filterService;
                    if (filterUrgency !== "all") params.urgency = filterUrgency;
                    if (sortBy) params.sort_by = sortBy;

                    const data = await apiService.getPendingMatches(params);

                    setPendingMatches(data.map(transformPendingMatchClient));
                    setMatchesByClient({});
                    success("Data refreshed successfully");
                  } catch (err) {
                    console.error("Error refreshing:", err);
                    showError("Failed to refresh data");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            }
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Pending Matches
              </h1>
              <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)] mt-1">
                Clients waiting to be matched with practitioners
              </p>
            </div>
          </DashboardHeader>

          {/* Stats Cards */}
          <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--purple-bg)] text-[var(--purple-primary)] flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                      Total Pending
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                      High Urgency
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      {stats.highUrgency}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                      Waiting 3+ Days
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      {stats.waitingOver3Days}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                      Low Cost Service
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                      {stats.lowCost}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-[var(--sidebar-bg)] border-b border-gray-200 dark:border-[var(--sidebar-border)] px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--input-border)] bg-white dark:bg-[var(--input-bg)] text-gray-900 dark:text-[var(--input-text)] rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
                />
              </div>
              <div className="min-w-[120px] flex-shrink-0">
                <SearchableSelect
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  options={[
                    { value: "all", label: "All Services" },
                    { value: "Low Cost", label: "Low Cost" },
                    { value: "Mid Range", label: "Mid Range" },
                  ]}
                  placeholder="All Services"
                  className="text-sm"
                />
              </div>
              <div className="min-w-[120px] flex-shrink-0">
                <SearchableSelect
                  value={filterUrgency}
                  onChange={(e) => setFilterUrgency(e.target.value)}
                  options={[
                    { value: "all", label: "All Urgency" },
                    { value: "high", label: "High" },
                    { value: "medium", label: "Medium" },
                    { value: "low", label: "Low" },
                  ]}
                  placeholder="All Urgency"
                  className="text-sm"
                />
              </div>
              <div className="min-w-[120px] flex-shrink-0">
                <SearchableSelect
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: "newest", label: "Sort: Newest" },
                    { value: "id", label: "Sort: Client ID" },
                    { value: "urgency", label: "Sort: Urgency" },
                    { value: "daysWaiting", label: "Sort: Days Waiting" },
                    { value: "name", label: "Sort: Name" },
                  ]}
                  placeholder="Sort: Urgency"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table View */}
          <div className="flex-1 overflow-auto bg-white dark:bg-[var(--background)] shadow-sm rounded-xl border border-gray-200 dark:border-[var(--card-border)] m-6">
            {loading && pendingMatches.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading pending matches...</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-gray-50 dark:bg-[var(--card-bg)] sticky top-0 z-10">
                  <tr>
                    <th className="w-1/3 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                      Client
                    </th>
                    <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                      Service Type
                    </th>
                    <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                      Waiting Days
                    </th>
                    <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                      Urgency
                    </th>
                    <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] border-b border-gray-200 dark:border-[var(--card-border)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[var(--card-border)]">
                  {filteredMatches.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">
                          No pending matches found
                        </p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMatches.map((client) => (
                      <PendingMatchRow
                        key={client.id}
                        client={client}
                        trainingCounsellors={trainingCounsellors}
                        matchResult={matchesByClient[client.id]}
                        onMatchComputed={(results) =>
                          setMatchesByClient((prev) => ({
                            ...prev,
                            [client.id]: results,
                          }))
                        }
                        setSelectedClient={setSelectedClient}
                        setShowAssignModal={setShowAssignModal}
                        setSelectedTC={setSelectedTC}
                        getUrgencyBadge={getUrgencyBadge}
                        formatName={formatName}
                        onMarkReady={handleMarkReady}
                      />
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pro Assign & Scheduling Modal */}
        {showAssignModal && selectedClient && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => {
                setShowAssignModal(false);
                setSelectedClient(null);
                setSelectedTC(null);
                setSelectedSlot(null);
              }}
            ></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-gray-200 dark:border-[var(--card-border)] overflow-hidden">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-[var(--card-border)] flex items-center justify-between bg-gray-50/80 dark:bg-[var(--bg-secondary)] flex-shrink-0">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[var(--purple-primary)]" />
                      Assign & Schedule Match
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-0.5">
                      Match client with a counsellor and allocate their weekly recurring session time
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedClient(null);
                      setSelectedTC(null);
                      setSelectedSlot(null);
                    }}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* Client Summary Banner */}
                  <div className="p-4 bg-[var(--purple-bg)] rounded-xl border border-[var(--purple-border)]">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[var(--purple-primary)]">
                          {formatName(selectedClient.name, "client")}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-[var(--purple-primary)] font-semibold rounded-full">
                          {selectedClient.serviceType}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                          {selectedClient.age ? `${selectedClient.age} yrs` : ""}
                        </span>
                      </div>
                      {selectedClient.primaryIssues?.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                          Issues: <span className="font-medium text-gray-800 dark:text-[var(--text-primary)]">{selectedClient.primaryIssues.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Client's Submitted Availability Summary */}
                    <div className="mt-2 pt-2 border-t border-[var(--purple-border)]/50">
                      <p className="text-xs font-semibold text-[var(--purple-primary)] mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Client's Submitted Availability:
                      </p>
                      {selectedClient.availability?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedClient.availability.map((availStr, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white/80 dark:bg-[var(--card-bg)] text-gray-700 dark:text-[var(--text-secondary)] border border-[var(--purple-border)] font-medium"
                            >
                              {availStr}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No specific availability slots submitted on intake form.</p>
                      )}
                    </div>
                  </div>

                  {/* Counsellor Selection Card */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-bold text-gray-900 dark:text-[var(--text-primary)]">
                        {selectedClient.serviceType !== "Low Cost" ? "Qualified Counsellor" : "Trainee Counsellor"}
                      </label>
                      {selectedTC && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTC(null);
                            setSelectedSlot(null);
                          }}
                          className="text-xs font-medium text-[var(--purple-primary)] hover:underline"
                        >
                          Change Counsellor
                        </button>
                      )}
                    </div>

                    {selectedTC ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-[var(--text-primary)] text-base">
                              {formatName(selectedTC.name, "tc")}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-semibold rounded-full">
                              {selectedTC.modality}
                            </span>
                            {selectedTC.matchScore && (
                              <span className="text-xs px-2 py-0.5 bg-[var(--purple-bg)] text-[var(--purple-primary)] border border-[var(--purple-border)] font-bold rounded-full">
                                {selectedTC.matchScore}% Match
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)]">
                            Active Caseload: <span className="font-semibold text-gray-900 dark:text-[var(--text-primary)]">{selectedTC.currentClients ?? 0}</span> / 6 clients
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <SearchableSelect
                          value={selectedTC?.id || ""}
                          onChange={(e) => {
                            const tcId = e.target.value;
                            if (tcId) {
                              const tc =
                                selectedClient.suggestedTCs.find((t) => t.id === tcId || t.uuid === tcId) ||
                                trainingCounsellors.find((t) => t.id === tcId || t.uuid === tcId);
                              if (tc) {
                                setSelectedTC({
                                  id: tc.uuid || tc.id,
                                  uuid: tc.uuid || tc.id,
                                  name: tc.name,
                                  modality: tc.modality || "N/A",
                                  matchScore: tc.matchScore || null,
                                  matchBreakdown: tc.matchBreakdown || null,
                                  flags: tc.flags || [],
                                  currentClients: tc.currentClients ?? tc.current_clients ?? 0,
                                  availability: tc.availability || "N/A",
                                  rawAvailability: tc.availability || tc.rawAvailability || {},
                                });
                                setSelectedSlot(null);
                              }
                            } else {
                              setSelectedTC(null);
                              setSelectedSlot(null);
                            }
                          }}
                          options={(selectedClient.suggestedTCs.length > 0
                            ? selectedClient.suggestedTCs
                            : trainingCounsellors.filter(
                                (tc) =>
                                  tc.status === "Active" &&
                                  tc.current_clients < (tc.max_clients || 6) &&
                                  ((selectedClient.serviceType === "Low Cost" && tc.counsellor_type === "Trainee") ||
                                    (selectedClient.serviceType !== "Low Cost" && tc.counsellor_type === "Qualified")),
                              )
                          ).map((tc) => ({
                            value: tc.uuid || tc.id,
                            label: `${tc.name} (${tc.modality})${tc.matchScore ? ` - ${tc.matchScore}% match` : ""}`,
                          }))}
                          placeholder="Choose a Counsellor..."
                        />

                        {/* Quick select suggested TCs */}
                        {selectedClient.suggestedTCs?.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mb-2 font-medium">
                              Top Algorithm Recommendations:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {selectedClient.suggestedTCs.map((tc) => (
                                <button
                                  key={tc.uuid || tc.id}
                                  type="button"
                                  onClick={() => {
                                    const fullTC = trainingCounsellors.find((t) => t.id === tc.id || t.uuid === tc.id || t.uuid === tc.uuid);
                                    setSelectedTC({
                                      ...tc,
                                      rawAvailability: fullTC?.availability || tc.rawAvailability || {},
                                    });
                                    setSelectedSlot(null);
                                  }}
                                  className="p-3 text-left border border-gray-200 dark:border-[var(--card-border)] rounded-lg hover:border-[var(--purple-primary)] hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-all group"
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="font-semibold text-xs text-gray-900 dark:text-[var(--text-primary)] group-hover:text-[var(--purple-primary)]">
                                      {tc.name}
                                    </span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-[var(--purple-primary)]">
                                      {tc.matchScore}%
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-500 mt-1">{tc.modality}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">{tc.currentClients ?? 0} active clients</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Flagged Mismatch Alert */}
                  {selectedTC && (selectedTC.flags || []).length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        The algorithm flagged this match
                      </p>
                      <ul className="space-y-1 ml-5 list-disc text-xs text-amber-800 dark:text-amber-300">
                        {selectedTC.flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-2 font-medium">
                        You can still assign this practitioner, but you must provide a written justification below.
                      </p>
                    </div>
                  )}

                  {/* WEEKLY SESSION SLOT ALLOCATION (PRO SCHEDULER & CONFLICT INSPECTOR) */}
                  {selectedTC && (
                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-[var(--card-border)] pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900 dark:text-[var(--text-primary)] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[var(--purple-primary)]" />
                            Weekly Session Day & Time Allocation
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)]">
                            Select one recurring weekly slot for the client's sessions based on overlapping availability
                          </p>
                        </div>

                        {/* Filter Toggles */}
                        {overlapSchedule && (
                          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[var(--bg-secondary)] p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setSlotFilter("overlap_only")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                slotFilter === "overlap_only"
                                  ? "bg-white dark:bg-[var(--card-bg)] text-[var(--purple-primary)] shadow-sm"
                                  : "text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900"
                              }`}
                            >
                              ⭐ Overlapping Only ({overlapSchedule.totalOverlapCount})
                            </button>
                            <button
                              type="button"
                              onClick={() => setSlotFilter("all")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                slotFilter === "all"
                                  ? "bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--text-primary)] shadow-sm"
                                  : "text-gray-600 dark:text-[var(--text-secondary)] hover:text-gray-900"
                              }`}
                            >
                              All Slots ({overlapSchedule.totalTCSlots})
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Overlap Summary Alert Banner */}
                      {overlapSchedule && (
                        <div>
                          {overlapSchedule.hasOverlap ? (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                              <span className="flex items-center gap-1.5 font-medium">
                                ⭐ <strong>{overlapSchedule.totalOverlapCount} overlapping weekly slot(s) found</strong> ({overlapSchedule.overlapPercentage}% overlap match).
                              </span>
                              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-normal">
                                Pick from the highlighted slots below
                              </span>
                            </div>
                          ) : (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                              ⚠️ <strong>No direct overlapping slots</strong> between the client's submitted times and counsellor's current schedule. You may still choose an available counsellor slot below after agreeing with the client.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Day Tabs */}
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveDayTab("all")}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            activeDayTab === "all"
                              ? "bg-[var(--purple-primary)] text-white shadow-sm"
                              : "bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-200"
                          }`}
                        >
                          All Days
                        </button>
                        {overlapSchedule?.days.map((day) => {
                          const hasOverlap = day.overlapCount > 0;
                          return (
                            <button
                              key={day.key}
                              type="button"
                              onClick={() => setActiveDayTab(day.key)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all ${
                                activeDayTab === day.key
                                  ? "bg-[var(--purple-primary)] text-white shadow-sm"
                                  : "bg-gray-100 dark:bg-[var(--bg-secondary)] text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-200"
                              }`}
                            >
                              {day.label}
                              {hasOverlap && (
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeDayTab === day.key ? "bg-white text-[var(--purple-primary)]" : "bg-emerald-100 text-emerald-800"}`}>
                                  {day.overlapCount} ⭐
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Slots List by Day */}
                      <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                        {loadingSlotBookings ? (
                          <div className="py-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[var(--purple-primary)]" />
                            Loading counsellor schedule & active bookings...
                          </div>
                        ) : (
                          overlapSchedule?.days
                            .filter((day) => activeDayTab === "all" || activeDayTab === day.key)
                            .map((day) => {
                              const slotsToRender = day.slots.filter((slot) => {
                                if (slotFilter === "overlap_only") return slot.isOverlap;
                                return slot.isTCAvailable || slot.isClientAvailable;
                              });

                              if (slotsToRender.length === 0) {
                                if (activeDayTab !== "all") {
                                  return (
                                    <div key={day.key} className="py-6 text-center text-xs text-gray-400 italic">
                                      No {slotFilter === "overlap_only" ? "overlapping" : "available"} slots on {day.label}.
                                    </div>
                                  );
                                }
                                return null;
                              }

                              return (
                                <div key={day.key} className="border border-gray-200 dark:border-[var(--card-border)] rounded-xl p-3.5 bg-gray-50/40 dark:bg-[var(--card-bg)]">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-[var(--text-primary)] uppercase tracking-wider">
                                      {day.label}
                                    </h4>
                                    <span className="text-[11px] text-gray-500">
                                      {day.overlapCount > 0 ? `${day.overlapCount} overlapping slot(s)` : "No overlap"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {slotsToRender.map((slot) => {
                                      const isSelected =
                                        selectedSlot?.day?.toLowerCase() === day.label.toLowerCase() &&
                                        selectedSlot?.slot === slot.value;

                                      // Booked clients lookup from slot bookings endpoint
                                      const bookings = tcSlotBookings[day.key]?.[slot.value] || [];
                                      const bookedCount = bookings.length;

                                      return (
                                        <div
                                          key={slot.value}
                                          onClick={() => {
                                            setSelectedSlot({
                                              day: day.label,
                                              slot: slot.value,
                                              label: slot.label,
                                              category: slot.category,
                                              bookedCount,
                                              bookings,
                                            });
                                          }}
                                          className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-2 ${
                                            isSelected
                                              ? "border-[var(--purple-primary)] bg-purple-50/80 dark:bg-purple-950/40 shadow-sm ring-2 ring-[var(--purple-primary)]"
                                              : slot.isOverlap
                                                ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-emerald-400 hover:bg-emerald-50/60"
                                                : "border-gray-200 dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] hover:border-[var(--purple-border)]"
                                          }`}
                                        >
                                          {/* Slot Time & Overlap Badge */}
                                          <div>
                                            <div className="flex items-start justify-between gap-1 mb-1">
                                              <span className="font-bold text-xs text-gray-900 dark:text-[var(--text-primary)]">
                                                {slot.label}
                                              </span>
                                              <input
                                                type="radio"
                                                name="selected_weekly_slot"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-[var(--purple-primary)] accent-[var(--purple-primary)] cursor-pointer mt-0.5"
                                              />
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {slot.isOverlap && (
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                                                  ⭐ Overlap Match
                                                </span>
                                              )}
                                              {!slot.isOverlap && slot.isTCAvailable && (
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                                                  Counsellor Free
                                                </span>
                                              )}
                                              {!slot.isTCAvailable && slot.isClientAvailable && (
                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium">
                                                  Client Requested
                                                </span>
                                              )}
                                            </div>
                                          </div>

                                          {/* Caseload / Conflict Badge */}
                                          <div className="pt-2 border-t border-gray-100 dark:border-[var(--card-border)] text-[11px]">
                                            {bookedCount > 0 ? (
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                                  <Users className="w-3 h-3 text-amber-600" />
                                                  <span>Already booked with {bookedCount} {bookedCount === 1 ? "client" : "clients"}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 dark:text-[var(--text-secondary)] truncate">
                                                  {bookings.map((b) => b.name).join(", ")}
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                                <span>0 booked (Fully Available)</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>

                      {/* Selected Slot Confirmation Summary */}
                      {selectedSlot ? (
                        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-[var(--purple-border)] flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-[var(--purple-primary)] flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              Assigned Weekly Slot: {selectedSlot.day} at {selectedSlot.label}
                            </p>
                            {selectedSlot.bookedCount > 0 && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                ⚠️ Notice: {selectedTC?.name} already has {selectedSlot.bookedCount} active client(s) booked at this day and time ({selectedSlot.bookings?.map(b => b.name).join(", ")}).
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedSlot(null)}
                            className="text-xs text-gray-500 hover:text-red-600 font-medium ml-2"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        selectedClient.serviceType === "Low Cost" && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span>
                              <strong>Required:</strong> Please click and select a weekly day & time slot above to schedule this Low Cost client.
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Assignment Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1.5">
                      Assignment Notes{" "}
                      {(selectedTC?.flags || []).length > 0 ? (
                        <span className="text-amber-600 font-semibold">
                          (Required — explain the flagged mismatch)
                        </span>
                      ) : (
                        "(Optional)"
                      )}
                    </label>
                    <textarea
                      id="assignmentNotes"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none bg-white dark:bg-[var(--card-bg)] text-gray-900 dark:text-[var(--text-primary)] text-sm"
                      rows={2}
                      placeholder={
                        (selectedTC?.flags || []).length > 0
                          ? "Explain why you're assigning this practitioner despite the flagged concerns..."
                          : "Add any notes or context about this assignment..."
                      }
                    />
                  </div>

                  {/* Notification Checkbox */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="sendNotification"
                      defaultChecked
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor="sendNotification"
                      className="text-xs text-gray-700 dark:text-[var(--text-secondary)] font-medium cursor-pointer"
                    >
                      Send confirmation email and session agreement link to client and counsellor
                    </label>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-[var(--card-border)] bg-gray-50/80 dark:bg-[var(--bg-secondary)] flex items-center justify-between flex-shrink-0">
                  <div className="text-xs text-gray-500">
                    {selectedClient.serviceType === "Low Cost" && !selectedSlot && selectedTC ? (
                      <span className="text-amber-600 font-medium">Select a weekly slot above to proceed</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedClient(null);
                        setSelectedTC(null);
                        setSelectedSlot(null);
                      }}
                      disabled={assignLoading}
                      className="px-5 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-700 dark:text-[var(--text-primary)] rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!selectedTC) {
                          showError("Please select a Counsellor before assigning.");
                          return;
                        }

                        if (selectedClient.serviceType === "Low Cost" && !selectedSlot) {
                          showError("Please select a specific day and time slot for this Low Cost client.");
                          return;
                        }

                        const assignmentNotes =
                          document.getElementById("assignmentNotes")?.value.trim() || "";
                        const flags = selectedTC.flags || [];

                        if (flags.length > 0 && !assignmentNotes) {
                          showError(
                            "This practitioner was flagged as a possible mismatch. Please add a note explaining the assignment before proceeding.",
                          );
                          return;
                        }

                        try {
                          setAssignLoading(true);

                          await apiService.assignMatch({
                            client_id: selectedClient.uuid || selectedClient.id,
                            tc_id: selectedTC.uuid || selectedTC.id,
                            match_score: selectedTC.matchScore || null,
                            match_breakdown: selectedTC.matchBreakdown || null,
                            flags,
                            assignment_notes: assignmentNotes,
                            send_notification:
                              document.getElementById("sendNotification")?.checked ?? true,
                            allocated_day: selectedSlot?.day || null,
                            allocated_time: selectedSlot?.slot || null,
                          });

                          success(
                            `Client "${selectedClient.name}" assigned to "${selectedTC.name}"${selectedSlot ? ` on ${selectedSlot.day}s at ${selectedSlot.label}` : ""} successfully!`,
                          );
                          setShowAssignModal(false);
                          setSelectedClient(null);
                          setSelectedTC(null);
                          setSelectedSlot(null);

                          // Refresh pending matches list
                          const params = {};
                          if (searchTerm) params.search = searchTerm;
                          if (filterService !== "all") params.service_type = filterService;
                          if (filterUrgency !== "all") params.urgency = filterUrgency;
                          if (sortBy) params.sort_by = sortBy;
                          const data = await apiService.getPendingMatches(params);
                          setPendingMatches(data.map(transformPendingMatchClient));
                          setMatchesByClient((prev) => {
                            const next = { ...prev };
                            delete next[selectedClient.id];
                            return next;
                          });
                        } catch (err) {
                          console.error("Error assigning match:", err);
                          showError(
                            err.message || "Failed to assign client. Please try again.",
                          );
                        } finally {
                          setAssignLoading(false);
                        }
                      }}
                      disabled={
                        assignLoading ||
                        !selectedTC ||
                        (selectedClient.serviceType === "Low Cost" && !selectedSlot)
                      }
                      className="px-6 py-2 text-white rounded-lg hover:opacity-90 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
                      style={{ backgroundColor: "#6f1d56" }}
                    >
                      {assignLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        "Assign & Set Schedule"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </PageGuard>
  );
}
