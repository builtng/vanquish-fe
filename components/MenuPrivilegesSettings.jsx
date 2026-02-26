"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import { Shield, Save, Check, X, Lock } from "lucide-react";

export default function MenuPrivilegesSettings() {
  const { success, error: showError } = useToast();
  const [privileges, setPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPrivileges();
  }, []);

  const loadPrivileges = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMenuPrivileges();
      setPrivileges(data);
    } catch (err) {
      showError("Failed to load menu privileges");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (menuId, role) => {
    const item = privileges.find((p) => p.menu_id === menuId);
    if (!item) return;

    let newRoles;
    if (item.roles.includes(role)) {
      newRoles = item.roles.filter((r) => r !== role);
    } else {
      newRoles = [...item.roles, role];
    }

    // Admins must always have access to crucial items
    if (
      role === "admin" &&
      ["users", "settings", "email-management"].includes(menuId) &&
      !newRoles.includes("admin")
    ) {
      showError("Admins must have access to management tools");
      return;
    }

    // Prevent making a menu item invisible to everyone
    if (newRoles.length === 0) {
      showError("At least one role must have access to each menu item");
      return;
    }

    try {
      const updatedItem = { ...item, roles: newRoles };
      // Optimistic update
      setPrivileges(
        privileges.map((p) => (p.menu_id === menuId ? updatedItem : p)),
      );

      await apiService.updateMenuPrivilege({
        menu_id: menuId,
        roles: newRoles,
      });

      success("Privilege updated");
    } catch (err) {
      showError("Failed to update privilege");
      loadPrivileges(); // Rollback
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const roles = ["admin", "staff", "counsellor"];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Menu Visibility Management
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Select which roles are allowed to see each menu item in the
              sidebar. Changes are applied immediately.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[var(--card-border)]">
          <thead className="bg-gray-50 dark:bg-[var(--hover-bg)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Menu Item
              </th>
              {roles.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[var(--card-bg)] divide-y divide-gray-200 dark:divide-[var(--card-border)]">
            {privileges.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)]"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                  {item.menu_id
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </td>
                {roles.map((role) => (
                  <td
                    key={role}
                    className="px-4 py-3 whitespace-nowrap text-center"
                  >
                    <button
                      onClick={() => toggleRole(item.menu_id, role)}
                      disabled={
                        // Lock admin access OFF for critical management items
                        role === "admin" &&
                        ["users", "settings", "email-management"].includes(
                          item.menu_id,
                        ) &&
                        item.roles.includes("admin")
                      }
                      title={
                        role === "admin" &&
                        ["users", "settings", "email-management"].includes(
                          item.menu_id,
                        ) &&
                        item.roles.includes("admin")
                          ? "Admins must always have access to this item"
                          : undefined
                      }
                      className={`w-10 h-6 inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                        item.roles.includes(role)
                          ? "bg-purple-600"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          item.roles.includes(role)
                            ? "translate-x-5"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
