"use client";

import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PageGuard from "@/components/PageGuard";
import { useToast } from "@/lib/toast";
import apiService from "@/lib/api";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  RefreshCw,
  UserMinus,
  UserPlus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";

const DAY_OPTIONS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const GRADIENT_MAP = {
  Monday: "from-purple-500 to-indigo-500",
  Tuesday: "from-pink-500 to-rose-500",
  Wednesday: "from-emerald-500 to-teal-500",
  Thursday: "from-orange-500 to-amber-500",
  Friday: "from-blue-500 to-cyan-500",
  Saturday: "from-violet-500 to-purple-500",
  Sunday: "from-red-500 to-pink-500",
};

function GroupFormModal({ group, onClose, onSaved }) {
  const { success, error: showError } = useToast();
  const [form, setForm] = useState({
    name: group?.name || "",
    supervisor_link: group?.supervisor_link || "",
    day_of_week: group?.day_of_week || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (group) {
        await apiService.request(`/attendance-groups/${group.id}`, {
          method: "PATCH",
          body: form,
        });
        success("Group updated successfully.");
      } else {
        await apiService.request("/attendance-groups", {
          method: "POST",
          body: form,
        });
        success("Group created successfully.");
      }
      onSaved();
    } catch (err) {
      showError("Failed to save group.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-[var(--card-border)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">
            {group ? "Edit Group" : "Create Peer Support Group"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Group Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Group 5 – Mondays"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Day of Week
            </label>
            <SearchableSelect
              value={form.day_of_week}
              onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
              options={DAY_OPTIONS.map((d) => ({ value: d, label: d }))}
              placeholder="— Select day —"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
              Supervisor Link
            </label>
            <input
              type="url"
              value={form.supervisor_link}
              onChange={(e) => setForm({ ...form, supervisor_link: e.target.value })}
              placeholder="https://form.jotform.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-[#6f1c56] outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {group ? "Save Changes" : "Create Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AllocateModal({ group, onClose, onAllocated }) {
  const { success, error: showError } = useToast();
  const [counsellors, setCounsellors] = useState([]);
  const [loadingTcs, setLoadingTcs] = useState(true);
  const [selectedTcId, setSelectedTcId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.request("/attendance-groups/unassigned?include_assigned=1");
        const availableCounsellors = Array.isArray(res)
          ? res.filter((tc) => tc.attendance_group_id !== group.id)
          : [];
        setCounsellors(availableCounsellors);
      } catch (err) {
        showError("Could not load counsellors.");
      } finally {
        setLoadingTcs(false);
      }
    };
    load();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedTcId) return;
    setSaving(true);
    try {
      await apiService.request(`/attendance-groups/${group.id}/allocate`, {
        method: "POST",
        body: { tc_id: selectedTcId },
      });
      success("Counsellor allocated to group.");
      onAllocated();
    } catch (err) {
      showError("Failed to allocate counsellor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-[var(--card-border)] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Add Counsellor</h2>
            <p className="text-xs text-gray-400 mt-0.5">to {group.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleAllocate} className="p-5 space-y-4">
          {loadingTcs ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : counsellors.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              All counsellors are already assigned to this group.
            </p>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Select Counsellor
              </label>
              <SearchableSelect
                value={selectedTcId}
                onChange={(e) => setSelectedTcId(e.target.value)}
                options={counsellors.map((tc) => ({
                  value: tc.id,
                  label: [
                    tc.tc_id ? `${tc.tc_id} - ${tc.name}` : tc.name,
                    tc.email,
                    tc.attendance_group?.name ? `Current: ${tc.attendance_group.name}` : "Unassigned",
                  ].filter(Boolean).join(" | "),
                }))}
                placeholder="— Choose counsellor —"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedTcId || counsellors.length === 0}
              className="flex-1 px-4 py-2.5 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Allocate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GroupCard({ group, onEdit, onDelete, onRefresh }) {
  const { success, error: showError } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [showAllocate, setShowAllocate] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const gradient = GRADIENT_MAP[group.day_of_week] || "from-[#6f1c56] to-purple-600";

  const handleDeallocate = async (tc) => {
    if (!confirm(`Remove ${tc.name} from ${group.name}?`)) return;
    setRemovingId(tc.id);
    try {
      await apiService.request(`/attendance-groups/${group.id}/deallocate`, {
        method: "POST",
        body: { tc_id: tc.id },
      });
      success(`${tc.name} removed.`);
      onRefresh();
    } catch (err) {
      showError("Failed to remove counsellor.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      {showAllocate && (
        <AllocateModal
          group={group}
          onClose={() => setShowAllocate(false)}
          onAllocated={() => { setShowAllocate(false); onRefresh(); }}
        />
      )}

      <div className="bg-white dark:bg-[var(--card-bg)] rounded-2xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {/* Card Header */}
        <div className={`bg-gradient-to-r ${gradient} p-5 text-white relative`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg leading-tight">{group.name}</h3>
                {group.day_of_week && (
                  <div className="flex items-center gap-1.5 text-white/80 text-xs font-medium mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {group.day_of_week}s
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onEdit(group)}
                className="p-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(group)}
                className="p-2 bg-white/15 hover:bg-red-500/60 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-bold">
              {group.training_counsellors_count ?? group.training_counsellors?.length ?? 0} Counsellors
            </div>
            {group.supervisor_link && (
              <a
                href={group.supervisor_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors"
              >
                <LinkIcon className="w-3 h-3" />
                Supervisor Link
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>
        </div>

        {/* Counsellors List */}
        <div className="p-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#6f1c56] transition-colors mb-3 uppercase tracking-widest"
          >
            <span>Members ({group.training_counsellors?.length ?? 0})</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded && (
            <div className="space-y-2 mb-3 animate-in slide-in-from-top-2 duration-200">
              {group.training_counsellors?.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  No counsellors assigned yet.
                </p>
              )}
              {group.training_counsellors?.map((tc) => (
                <div
                  key={tc.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#6f1c56]/10 flex items-center justify-center text-[#6f1c56] text-xs font-bold flex-shrink-0">
                      {tc.name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{tc.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {[tc.tc_id, tc.email].filter(Boolean).join(" | ")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeallocate(tc)}
                    disabled={removingId === tc.id}
                    className="flex-shrink-0 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from group"
                  >
                    {removingId === tc.id
                      ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      : <UserMinus className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowAllocate(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#6f1c56]/30 text-[#6f1c56] text-xs font-bold rounded-xl hover:bg-[#6f1c56]/5 hover:border-[#6f1c56]/50 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Add Counsellor
          </button>
        </div>
      </div>
    </>
  );
}

export default function PsgGroupsPage() {
  const { success, error: showError } = useToast();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.request("/attendance-groups");
      setGroups(Array.isArray(res) ? res : []);
    } catch (err) {
      showError("Failed to load Peer Support Groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleDelete = async (group) => {
    if (!confirm(`Delete "${group.name}"? All counsellors will be unassigned.`)) return;
    try {
      await apiService.request(`/attendance-groups/${group.id}`, { method: "DELETE" });
      success("Group deleted.");
      loadGroups();
    } catch (err) {
      showError("Failed to delete group.");
    }
  };

  return (
    <PageGuard menuId="psg-groups">
      <DashboardLayout>
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center justify-between max-w-6xl">
              <div>
                <h1 className="text-xl font-black text-foreground">Peer Support Groups</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage Peer Support Groups and counsellor allocations
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadGroups}
                  className="p-2.5 hover:bg-accent/10 rounded-xl text-muted-foreground transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#6f1c56]/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  New Group
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 max-w-6xl">
            {/* Create / Edit Modal */}
            {(showCreateModal || editingGroup) && (
              <GroupFormModal
                group={editingGroup}
                onClose={() => { setShowCreateModal(false); setEditingGroup(null); }}
                onSaved={() => { setShowCreateModal(false); setEditingGroup(null); loadGroups(); }}
              />
            )}

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <RefreshCw className="w-6 h-6 animate-spin text-[#6f1c56]/50" />
              </div>
            ) : groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#6f1c56]/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-[#6f1c56]" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">No Peer Support Groups Yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Create your first Peer Support Group to start managing counsellor attendance.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#6f1c56] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#6f1c56]/20"
                >
                  <Plus className="w-4 h-4" /> Create First Group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEdit={setEditingGroup}
                    onDelete={handleDelete}
                    onRefresh={loadGroups}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </PageGuard>
  );
}
