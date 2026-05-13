"use client";

import React, { useState, useEffect, useRef } from "react";
import { Upload, X, Save, Image as ImageIcon, Building2, FileText, Globe, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import apiService from "@/lib/api";
import { useModal } from "@/contexts/ModalContext";

export default function CompanyBrandingSettings() {
  const { success, error: showError } = useToast();
  const { confirm } = useModal();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    company_name: "",
    company_tagline: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_website: "",
    pdf_header_text: "",
    pdf_footer_text: "",
    platform_logo_url: "",
    platform_logo_dark_url: "",
    consultation_zoom_link: "",
  });

  const logoInputRef = useRef(null);
  const logoDarkInputRef = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanySettings();
      setSettings((prev) => ({ ...prev, ...data }));
    } catch (err) {
      showError("Failed to load branding settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const toUpdate = { ...settings };
      // Don't send URLs in the text update
      delete toUpdate.platform_logo_url;
      delete toUpdate.platform_logo_dark_url;
      
      await apiService.updateCompanySettings(toUpdate);
      success("Branding settings updated successfully");
    } catch (err) {
      showError(err.message || "Failed to update branding settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type and size
    if (!file.type.match("image.*")) {
      showError("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showError("Image size should be less than 2MB");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append(type === "logo" ? "logo" : "logo_dark", file);
      
      const response = await apiService.uploadLogo(formData);
      const newUrl = type === "logo" ? response.urls.platform_logo_url : response.urls.platform_logo_dark_url;
      
      setSettings(prev => ({
        ...prev,
        [type === "logo" ? "platform_logo_url" : "platform_logo_dark_url"]: newUrl
      }));
      
      success(`${type === "logo" ? "Main" : "Dark"} logo uploaded successfully`);
    } catch (err) {
      showError("Failed to upload logo");
    } finally {
      setSaving(false);
      // Reset input
      if (type === "logo") logoInputRef.current.value = "";
      else logoDarkInputRef.current.value = "";
    }
  };

  const handleDeleteLogo = async (type) => {
    const ok = await confirm({
      title: "Remove Logo",
      message: `Are you sure you want to remove the ${type === 'logo' ? 'main' : 'dark'} logo?`,
      confirmText: "Remove",
      type: "danger"
    });
    if (!ok) return;

    try {
      setSaving(true);
      await apiService.deleteLogo(type);
      setSettings(prev => ({
        ...prev,
        [type === "logo" ? "platform_logo_url" : "platform_logo_dark_url"]: ""
      }));
      success("Logo removed");
    } catch (err) {
      showError("Failed to remove logo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Company Info section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">Company Details</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Company Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="company_name"
                  value={settings.company_name || ""}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
                  placeholder="Vanquish Training"
                />
                <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Tagline</label>
              <input
                type="text"
                name="company_tagline"
                value={settings.company_tagline || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
                placeholder="Making management simple"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    name="company_email"
                    value={settings.company_email || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
                    placeholder="contact@company.com"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Phone</label>
                <div className="relative">
                  <input
                    type="text"
                    name="company_phone"
                    value={settings.company_phone || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
                    placeholder="+44 20 1234 5678"
                  />
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Website</label>
              <div className="relative">
                <input
                  type="text"
                  name="company_website"
                  value={settings.company_website || ""}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
                  placeholder="https://company.com"
                />
                <Globe className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Consultation Zoom Link</label>
              <div className="relative">
                <input
                  type="text"
                  name="consultation_zoom_link"
                  value={settings.consultation_zoom_link || ""}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
                  placeholder="https://zoom.us/j/..."
                />
                <Video className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              </div>
              <p className="text-[10px] text-gray-500 mt-1 italic">This link will be used for all intake consultations.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Address</label>
              <div className="relative">
                <textarea
                  name="company_address"
                  value={settings.company_address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)] resize-none"
                  placeholder="123 Business Street, London, UK"
                />
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">Platform Branding</h3>
          </div>

          <div className="space-y-6">
            {/* Main Logo */}
            <div className="bg-gray-50 dark:bg-[var(--hover-bg)] p-4 rounded-xl border border-dashed border-gray-300 dark:border-[var(--card-border)]">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[var(--text-secondary)] mb-4">Main Platform Logo (Light Mode)</label>
              <div className="flex flex-col items-center gap-4">
                {settings.platform_logo_url ? (
                  <div className="relative group">
                    <img 
                      src={settings.platform_logo_url} 
                      alt="Company Logo" 
                      className="max-h-24 object-contain bg-white p-2 rounded border border-gray-200"
                    />
                    <button 
                      onClick={() => handleDeleteLogo('logo')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-24 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs">No main logo uploaded</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--card-bg)] border border-gray-300 dark:border-[var(--card-border)] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {settings.platform_logo_url ? "Change Logo" : "Upload Logo"}
                </button>
              </div>
            </div>

            {/* Dark Mode Logo */}
            <div className="bg-gray-900 p-4 rounded-xl border border-dashed border-gray-700">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Dark Mode Platform Logo</label>
              <div className="flex flex-col items-center gap-4">
                {settings.platform_logo_dark_url ? (
                  <div className="relative group">
                    <img 
                      src={settings.platform_logo_dark_url} 
                      alt="Company Logo Dark" 
                      className="max-h-24 object-contain p-2"
                    />
                    <button 
                      onClick={() => handleDeleteLogo('logo_dark')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-24 flex flex-col items-center justify-center text-gray-600">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-xs">No dark logo uploaded</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={logoDarkInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'logo_dark')}
                />
                <button 
                  onClick={() => logoDarkInputRef.current?.click()}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {settings.platform_logo_dark_url ? "Change Dark Logo" : "Upload Dark Logo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export branding section */}
      <div className="border-t border-gray-200 dark:border-[var(--card-border)] pt-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-gray-900 dark:text-[var(--text-primary)]">PDF Report Branding</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Standard Report Header</label>
            <input
              type="text"
              name="pdf_header_text"
              value={settings.pdf_header_text || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
              placeholder="Vanquish Training Management System"
            />
            <p className="text-[10px] text-gray-500 mt-1 italic">This text appears at the top of all PDF exports.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[var(--text-secondary)] mb-1">Standard Report Footer</label>
            <input
              type="text"
              name="pdf_footer_text"
              value={settings.pdf_footer_text || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] rounded-lg dark:bg-[var(--input-bg)] dark:text-[var(--text-primary)]"
              placeholder="Confidential — For internal use only"
            />
            <p className="text-[10px] text-gray-500 mt-1 italic">This text appears at the bottom of all PDF exports.</p>
          </div>
        </div>
      </div>

      {/* Global Action Button */}
      <div className="flex justify-end sticky bottom-0 py-4 bg-white dark:bg-[var(--background)] border-t border-gray-100 dark:border-[var(--card-border)] z-10">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 font-bold"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving Changes..." : "Save Branding Settings"}
        </button>
      </div>
    </div>
  );
}
