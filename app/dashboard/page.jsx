"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  FileText,
  Video,
  Plus,
  Eye,
  Mail,
  Phone,
  ChevronRight,
  Bell,
  UserCheck,
  Activity,
  BarChart3,
  Menu,
  Home,
  ClipboardList,
  Settings,
  LogOut,
  X,
  User,
  MapPin,
  Save,
} from "lucide-react";

export default function ClientDashboard() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    address: "",
    postcode: "",
    gender: "",
    ethnicity: "",
    sexualOrientation: "",
    voicemailPermission: "Yes",
    howHeardAbout: "",
    primaryIssues: [],
    additionalDetails: "",
    medication: "",
    disabilities: "",
    riskFlags: "",
    substanceMisuse: "",
    availability: [],
  });

  // Mock Data
  const stats = {
    totalClients: 156,
    totalChange: "+12 this month",
    activeTherapy: 42,
    activeChange: "↑ 3 new",
    pendingMatch: 8,
    pendingNote: "Needs review",
    consultations: 12,
    consultationsNote: "3 today",
  };

  const urgentItems = [
    {
      id: 1,
      type: "consultation",
      icon: Video,
      message: "2 consultations today",
      details: "Victoria James (10:00 AM), Robert Davies (2:00 PM)",
      priority: "high",
      action: "View Schedule",
    },
    {
      id: 2,
      type: "stuck",
      icon: Clock,
      message: "5 clients stuck in Agreement Pending",
      details: "No response for over 7 days",
      priority: "medium",
      action: "Review Clients",
    },
    {
      id: 3,
      type: "risk",
      icon: AlertTriangle,
      message: "1 client with risk flag needs follow-up",
      details: "High priority - requires immediate attention",
      priority: "high",
      action: "View Client",
    },
  ];

  const pipelineStages = [
    { stage: "Application", count: 15, color: "#3b82f6", icon: FileText },
    { stage: "Consultation", count: 12, color: "#8b5cf6", icon: Video },
    { stage: "Matched", count: 8, color: "#10b981", icon: UserCheck },
    { stage: "Agreement", count: 6, color: "#f59e0b", icon: CheckCircle },
    { stage: "Active", count: 42, color: "#6f1d56", icon: CheckCircle },
  ];

  const recentActivity = [
    {
      id: 1,
      client: "Emma Wilson",
      action: 'moved to "Active Therapy"',
      time: "5 min ago",
      color: "green",
    },
    {
      id: 2,
      client: "John Smith",
      action: "consultation completed",
      time: "1 hour ago",
      color: "blue",
    },
    {
      id: 3,
      client: "Sarah Jones",
      action: "submitted new application",
      time: "2 hours ago",
      color: "purple",
    },
    {
      id: 4,
      client: "Michael Brown",
      action: "signed agreement",
      time: "3 hours ago",
      color: "green",
    },
    {
      id: 5,
      client: "Charlotte Evans",
      action: "matched with Sarah Johnson",
      time: "4 hours ago",
      color: "green",
    },
    {
      id: 6,
      client: "David Martinez",
      action: "consultation booked for tomorrow",
      time: "5 hours ago",
      color: "blue",
    },
    {
      id: 7,
      client: "Lisa Anderson",
      action: 'moved to "Agreement Pending"',
      time: "6 hours ago",
      color: "yellow",
    },
    {
      id: 8,
      client: "Thomas Wright",
      action: "submitted new application",
      time: "8 hours ago",
      color: "purple",
    },
  ];

  const StatCard = ({ icon: Icon, label, value, sublabel, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-xs text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && <p className="text-xs text-gray-500 mt-1">{change}</p>}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
      {sublabel && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs font-medium" style={{ color }}>
            {sublabel}
          </span>
          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
        </div>
      )}
    </div>
  );

  const UrgentItem = ({ item }) => (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
        item.priority === "high"
          ? "bg-red-50 border-red-200 hover:border-red-300"
          : "bg-orange-50 border-orange-200 hover:border-orange-300"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          item.priority === "high" ? "bg-red-100" : "bg-orange-100"
        }`}
      >
        <item.icon
          className={`w-5 h-5 ${
            item.priority === "high" ? "text-red-600" : "text-orange-600"
          }`}
        />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 text-sm mb-1">
          {item.message}
        </h4>
        <p className="text-xs text-gray-600 mb-2">{item.details}</p>
        <button
          className={`text-xs font-medium flex items-center gap-1 ${
            item.priority === "high"
              ? "text-red-600 hover:text-red-700"
              : "text-orange-600 hover:text-orange-700"
          }`}
        >
          {item.action}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  VT
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900">Vanquish</h1>
                  <p className="text-xs text-gray-600">Admin</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            {
              id: "overview",
              icon: Home,
              label: "Overview",
              href: "/dashboard",
            },
            {
              id: "consultations",
              icon: Video,
              label: "Consultations",
              badge: 3,
              href: "/dashboard/consultations",
            },
            {
              id: "matches",
              icon: UserCheck,
              label: "Pending Matches",
              badge: 8,
              href: "/dashboard",
            },
            {
              id: "tcs",
              icon: Users,
              label: "Training Counsellors",
              href: "/dashboard/training-counsellors",
            },
            {
              id: "clients",
              icon: ClipboardList,
              label: "All Clients",
              href: "/dashboard/clients",
            },
            {
              id: "activity",
              icon: Activity,
              label: "Activity Log",
              href: "/dashboard",
            },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-purple-100 text-purple-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">
                      {item.label}
                    </span>
                    {item.badge > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Client Dashboard
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Overview of all clients and their journey through the system
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Export Report
                </button>
                <Link
                  href="/dashboard/clients/edit"
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <Plus className="w-4 h-4" />
                  Add New Client
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Stats Cards - Single Row */}
              <div className="grid grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Clients"
                  value={stats.totalClients}
                  change={stats.totalChange}
                  color="#6f1d56"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Active in Therapy"
                  value={stats.activeTherapy}
                  change={stats.activeChange}
                  sublabel="View Active Clients"
                  color="#10b981"
                />
                <StatCard
                  icon={UserCheck}
                  label="Pending Match"
                  value={stats.pendingMatch}
                  sublabel={stats.pendingNote}
                  color="#f59e0b"
                />
                <StatCard
                  icon={Video}
                  label="Consultations This Week"
                  value={stats.consultations}
                  sublabel={stats.consultationsNote}
                  color="#3b82f6"
                />
              </div>

              {/* Needs Attention Section - More Compact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Needs Attention
                    </h2>
                    <p className="text-sm text-gray-600">
                      {urgentItems.length} items require your attention
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {urgentItems.map((item) => (
                    <UrgentItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Pipeline and Activity - More Compact */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Pipeline Visualization */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Client Pipeline
                        </h2>
                        <p className="text-sm text-gray-600">
                          Journey from application to active therapy
                        </p>
                      </div>
                      <button
                        className="text-sm font-medium hover:opacity-80 flex items-center gap-1"
                        style={{ color: "#6f1d56" }}
                      >
                        View All Stages
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {pipelineStages.map((stage, index) => (
                        <React.Fragment key={stage.stage}>
                          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-w-[120px] hover:shadow-lg transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <stage.icon
                                className="w-6 h-6"
                                style={{ color: stage.color }}
                              />
                              <span
                                className="text-2xl font-bold"
                                style={{ color: stage.color }}
                              >
                                {stage.count}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-gray-700">
                              {stage.stage}
                            </p>
                          </div>
                          {index < pipelineStages.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          Recent Activity
                        </h2>
                        <p className="text-sm text-gray-600">Latest updates</p>
                      </div>
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              activity.color === "green"
                                ? "bg-green-500"
                                : activity.color === "blue"
                                ? "bg-blue-500"
                                : activity.color === "purple"
                                ? "bg-purple-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <span className="font-semibold">
                                {activity.client}
                              </span>{" "}
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {activity.time}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions - More Compact */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-200 p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-gray-600">
                    Common tasks for client management
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/clients"
                    className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      View All Clients
                    </h3>
                    <p className="text-sm text-gray-600">
                      See complete client list with filters
                    </p>
                  </Link>

                  <Link
                    href="/dashboard/consultations"
                    className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Book Consultation
                    </h3>
                    <p className="text-sm text-gray-600">
                      Schedule initial consultation
                    </p>
                  </Link>

                  <button className="bg-white p-5 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Review Matches
                    </h3>
                    <p className="text-sm text-gray-600">
                      Approve pending TC matches
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Add New Client
              </h2>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission here
                console.log("New client data:", newClientForm);
                alert("Client added successfully! (This is a demo)");
                setIsNewClientModalOpen(false);
                // Reset form
                setNewClientForm({
                  name: "",
                  age: "",
                  email: "",
                  phone: "",
                  address: "",
                  postcode: "",
                  gender: "",
                  ethnicity: "",
                  sexualOrientation: "",
                  voicemailPermission: "Yes",
                  howHeardAbout: "",
                  primaryIssues: [],
                  additionalDetails: "",
                  medication: "",
                  disabilities: "",
                  riskFlags: "",
                  substanceMisuse: "",
                  availability: [],
                });
              }}
              className="p-6 space-y-6"
            >
              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientForm.name}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      required
                      min="18"
                      value={newClientForm.age}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          age: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={newClientForm.email}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newClientForm.phone}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          phone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="+44 7700 900101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newClientForm.address}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="123 High Street, London"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={newClientForm.postcode}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          postcode: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="SW1A 1AA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      required
                      value={newClientForm.gender}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          gender: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ethnicity
                    </label>
                    <input
                      type="text"
                      value={newClientForm.ethnicity}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          ethnicity: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="White British"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexual Orientation
                    </label>
                    <select
                      value={newClientForm.sexualOrientation}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          sexualOrientation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="">Select orientation</option>
                      <option value="Heterosexual">Heterosexual</option>
                      <option value="Homosexual">Homosexual</option>
                      <option value="Bisexual">Bisexual</option>
                      <option value="Asexual">Asexual</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voicemail Permission
                    </label>
                    <select
                      value={newClientForm.voicemailPermission}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          voicemailPermission: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      How They Heard About Us
                    </label>
                    <input
                      type="text"
                      value={newClientForm.howHeardAbout}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          howHeardAbout: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Social Media (Instagram)"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Clinical Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Issues / Concerns
                    </label>
                    <input
                      type="text"
                      value={
                        Array.isArray(newClientForm.primaryIssues)
                          ? newClientForm.primaryIssues.join(", ")
                          : ""
                      }
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          primaryIssues: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Depression, Anxiety, Work Stress"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple issues with commas
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Details
                    </label>
                    <textarea
                      value={newClientForm.additionalDetails}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          additionalDetails: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                      placeholder="Describe the client's situation, concerns, and any relevant background information..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication
                      </label>
                      <input
                        type="text"
                        value={newClientForm.medication}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            medication: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="None or medication details"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disabilities / Impairments
                      </label>
                      <input
                        type="text"
                        value={newClientForm.disabilities}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            disabilities: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="None or details"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risk Flags
                      </label>
                      <input
                        type="text"
                        value={newClientForm.riskFlags}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            riskFlags: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="None reported or risk details"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Substance Misuse
                      </label>
                      <input
                        type="text"
                        value={newClientForm.substanceMisuse}
                        onChange={(e) =>
                          setNewClientForm({
                            ...newClientForm,
                            substanceMisuse: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        placeholder="Social drinker only, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-all"
                  style={{ backgroundColor: "#6f1d56" }}
                >
                  <Save className="w-4 h-4" />
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
