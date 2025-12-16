"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import apiService from "@/lib/api";
import SearchableSelect from "@/components/SearchableSelect";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/DashboardHeader";
import * as XLSX from "xlsx";
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
  ChevronDown,
  Bell,
  UserCheck,
  Activity,
  BarChart3,
  Menu,
  Home,
  ClipboardList,
  X,
  User,
  MapPin,
  Save,
  Building2,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

export default function ClientDashboard() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalChange: "+0 this month",
    activeTherapy: 0,
    activeChange: "↑ 0 new",
    pendingMatch: 0,
    pendingNote: "Needs review",
    consultations: 0,
    consultationsNote: "0 today",
  });
  const [pipelineStages, setPipelineStages] = useState([
    { stage: "Application", count: 0, color: "#3b82f6", icon: FileText },
    { stage: "Consultation", count: 0, color: "#6366F1", icon: Video },
    { stage: "Matched", count: 0, color: "#10B981", icon: UserCheck },
    { stage: "Agreement", count: 0, color: "#f59e0b", icon: CheckCircle },
    { stage: "Active", count: 0, color: "#6f1d56", icon: CheckCircle },
  ]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [urgentItems, setUrgentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsAttentionExpanded, setNeedsAttentionExpanded] = useState(true);
  const [recentActivityExpanded, setRecentActivityExpanded] = useState(true);

  // Update UK time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get UK time greeting
  const getUKGreeting = () => {
    // Get hour in UK timezone using Intl.DateTimeFormat
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "numeric",
      hour12: false,
    });
    const hour = parseInt(formatter.format(currentTime));
    const userName = user?.name || "there";
    
    let greeting;
    if (hour >= 5 && hour < 12) {
      greeting = `Good morning`;
    } else if (hour >= 12 && hour < 17) {
      greeting = `Good afternoon`;
    } else if (hour >= 17 && hour < 21) {
      greeting = `Good evening`;
    } else {
      greeting = `Good night`;
    }
    
    return `${greeting}, ${userName.split(' ')[0]}!`;
  };

  // Format UK time
  const getUKTime = () => {
    return currentTime.toLocaleString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Format UK date
  const getUKDate = () => {
    return currentTime.toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
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

  // Fetch dashboard data from API
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all data in parallel with error handling for each request
        const [clientsResult, pendingMatchesResult, consultationsResult, activityResult] = await Promise.allSettled([
          apiService.getClients(),
          apiService.getPendingMatches(),
          apiService.getConsultations(),
          apiService.getActivityLogs({ per_page: 10 }),
        ]);
        
        // Handle clients data
        let allClients = [];
        if (clientsResult.status === 'fulfilled') {
          const clientsData = clientsResult.value;
          allClients = Array.isArray(clientsData) ? clientsData : clientsData.data || [];
        } else {
          console.error('Error fetching clients:', clientsResult.reason);
          if (clientsResult.reason?.message?.includes('Too many requests')) {
            throw new Error('Rate limit exceeded. Please wait a moment and refresh the page.');
          }
        }
        
        // Handle pending matches data
        let pendingMatches = [];
        if (pendingMatchesResult.status === 'fulfilled') {
          const pendingMatchesData = pendingMatchesResult.value;
          pendingMatches = Array.isArray(pendingMatchesData) ? pendingMatchesData : [];
        } else {
          console.error('Error fetching pending matches:', pendingMatchesResult.reason);
        }
        
        // Handle consultations data
        let consultations = [];
        if (consultationsResult.status === 'fulfilled') {
          const consultationsData = consultationsResult.value;
          consultations = Array.isArray(consultationsData) ? consultationsData : [];
        } else {
          console.error('Error fetching consultations:', consultationsResult.reason);
        }
        
        // Handle activity logs data
        let activities = [];
        if (activityResult.status === 'fulfilled') {
          const activityData = activityResult.value;
          activities = Array.isArray(activityData) ? activityData : activityData.data || [];
        } else {
          console.error('Error fetching activity logs:', activityResult.reason);
        }
        
        if (!isMounted) return;
        
        // Calculate stats
        const totalClients = allClients.length;
        const activeTherapy = allClients.filter(c => c.stage === 'Active Therapy').length;
        const pendingMatch = pendingMatches.length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayConsultations = consultations.filter(c => {
          const consultationDate = c.scheduled_at ? c.scheduled_at.split('T')[0] : null;
          return consultationDate === today && c.status === 'scheduled';
        }).length;
        
        const thisWeekConsultations = consultations.filter(c => c.status === 'scheduled').length;
        
        // Calculate pipeline stages
        const applicationCount = allClients.filter(c => c.stage === 'Application').length;
        const consultationCount = allClients.filter(c => c.stage === 'Consultation Booked' || c.stage === 'Consultation Completed').length;
        const matchedCount = allClients.filter(c => c.stage === 'Matched').length;
        const agreementCount = allClients.filter(c => c.stage === 'Agreement Pending').length;
        const activeCount = allClients.filter(c => c.stage === 'Active Therapy').length;
        
        setPipelineStages([
          { stage: "Application", count: applicationCount, color: "#3b82f6", icon: FileText },
          { stage: "Consultation", count: consultationCount, color: "#6366F1", icon: Video },
          { stage: "Matched", count: matchedCount, color: "#10B981", icon: UserCheck },
          { stage: "Agreement", count: agreementCount, color: "#f59e0b", icon: CheckCircle },
          { stage: "Active", count: activeCount, color: "#6f1d56", icon: CheckCircle },
        ]);
        
        // Transform activity logs to recent activity
        const transformedActivities = activities.slice(0, 10).map((log, index) => {
          let color = "gray";
          if (log.action.includes('completed') || log.action.includes('matched') || log.action.includes('signed')) {
            color = "green";
          } else if (log.action.includes('consultation') || log.action.includes('booked')) {
            color = "blue";
          } else if (log.action.includes('application') || log.action.includes('created')) {
            color = "purple";
          } else if (log.action.includes('pending') || log.action.includes('stuck')) {
            color = "yellow";
          }
          
          const timeAgo = log.created_at ? (() => {
            const now = new Date();
            const created = new Date(log.created_at);
            const diffMs = now - created;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          })() : 'Recently';
          
          return {
            id: log.id || index,
            client: log.description?.split(' ')[0] || 'System',
            action: log.description?.substring(log.description.indexOf(' ') + 1) || log.action,
            time: timeAgo,
            color: color
          };
        });
        
        setRecentActivity(transformedActivities);
        
        // Build urgent items
        const urgentItemsList = [];
        
        if (todayConsultations > 0) {
          urgentItemsList.push({
            id: 1,
            type: "consultation",
            icon: Video,
            message: `${todayConsultations} consultation${todayConsultations > 1 ? 's' : ''} today`,
            details: "Requires attention",
            priority: "high",
            action: "View Schedule",
          });
        }
        
        const stuckClients = allClients.filter(c => c.stage === 'Agreement Pending' && c.status === 'stuck');
        if (stuckClients.length > 0) {
          urgentItemsList.push({
            id: 2,
            type: "stuck",
            icon: Clock,
            message: `${stuckClients.length} client${stuckClients.length > 1 ? 's' : ''} stuck in Agreement Pending`,
            details: "No response for over 7 days",
            priority: "medium",
            action: "Review Clients",
          });
        }
        
        const riskClients = allClients.filter(c => c.risk_flags && c.risk_flags !== 'None reported');
        if (riskClients.length > 0) {
          urgentItemsList.push({
            id: 3,
            type: "risk",
            icon: AlertTriangle,
            message: `${riskClients.length} client${riskClients.length > 1 ? 's' : ''} with risk flag${riskClients.length > 1 ? 's' : ''} need${riskClients.length === 1 ? 's' : ''} follow-up`,
            details: "High priority - requires immediate attention",
            priority: "high",
            action: "View Client",
          });
        }
        
        setUrgentItems(urgentItemsList);
        
        // Update stats
        setStats({
          totalClients: totalClients,
          totalChange: "+0 this month", // TODO: Calculate from date comparison
          activeTherapy: activeTherapy,
          activeChange: `↑ ${activeTherapy} active`,
          pendingMatch: pendingMatch,
          pendingNote: pendingMatch > 0 ? "Needs review" : "All caught up",
          consultations: thisWeekConsultations,
          consultationsNote: `${todayConsultations} today`,
        });
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Show user-friendly error message for rate limiting
        if (err.message?.includes('Too many requests') || err.message?.includes('Rate limit')) {
          // You might want to show a toast notification here
          console.warn('Rate limit exceeded. Please wait before refreshing.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!isLoading && user) {
      fetchDashboardData();
    }
    
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [user, isLoading]);

  // If not authenticated, the AuthContext will redirect to login
  if (!user) {
    return null;
  }

  const handleExportReport = async () => {
    try {
      // Fetch all necessary data for export
      const clientsData = await apiService.getClients();
      const allClients = Array.isArray(clientsData) ? clientsData : clientsData.data || [];
      
      const pendingMatchesData = await apiService.getPendingMatches();
      const pendingMatches = Array.isArray(pendingMatchesData) ? pendingMatchesData : [];
      
      const consultationsData = await apiService.getConsultations();
      const consultations = Array.isArray(consultationsData) ? consultationsData : [];
      
      // Calculate stats from fetched data
      const totalClients = allClients.length;
      const activeTherapy = allClients.filter(c => c.stage === 'Active Therapy').length;
      const pendingMatch = pendingMatches.length;
      
      const today = new Date().toISOString().split('T')[0];
      const todayConsultations = consultations.filter(c => {
        const consultationDate = c.scheduled_at ? c.scheduled_at.split('T')[0] : null;
        return consultationDate === today && c.status === 'scheduled';
      }).length;
      
      const thisWeekConsultations = consultations.filter(c => c.status === 'scheduled').length;
      
      // Calculate pipeline stages
      const applicationCount = allClients.filter(c => c.stage === 'Application').length;
      const consultationCount = allClients.filter(c => c.stage === 'Consultation Booked' || c.stage === 'Consultation Completed').length;
      const matchedCount = allClients.filter(c => c.stage === 'Matched').length;
      const agreementCount = allClients.filter(c => c.stage === 'Agreement Pending').length;
      const activeCount = allClients.filter(c => c.stage === 'Active Therapy').length;
      
      const exportPipelineStages = [
        { stage: "Application", count: applicationCount },
        { stage: "Consultation", count: consultationCount },
        { stage: "Matched", count: matchedCount },
        { stage: "Agreement", count: agreementCount },
        { stage: "Active", count: activeCount },
      ];
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Dashboard Summary
      const summaryData = [
        ['Dashboard Report'],
        ['Generated', new Date().toLocaleString('en-GB')],
        [],
        ['Summary Statistics'],
        ['Total Clients', totalClients],
        ['Active in Therapy', activeTherapy],
        ['Pending Matches', pendingMatch],
        ['Consultations This Week', thisWeekConsultations],
        ['Consultations Today', todayConsultations],
        [],
        ['Pipeline Stages'],
        ['Stage', 'Count'],
        ...exportPipelineStages.map(stage => [stage.stage, stage.count]),
      ];

      const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

      // Sheet 2: All Clients
      if (allClients.length > 0) {
        const clientsHeaders = [
          'Client ID', 'Name', 'Email', 'Phone', 'Age', 'Gender', 
          'Stage', 'Status', 'Service Type', 'Created At'
        ];
        const clientsRows = allClients.map(client => [
          client.client_id || '',
          client.name || '',
          client.email || '',
          client.phone || '',
          client.age || '',
          client.gender || '',
          client.stage || '',
          client.status || '',
          client.service_type || '',
          client.created_at ? new Date(client.created_at).toLocaleDateString('en-GB') : ''
        ]);
        const clientsData = [clientsHeaders, ...clientsRows];
        const ws2 = XLSX.utils.aoa_to_sheet(clientsData);
        XLSX.utils.book_append_sheet(wb, ws2, 'All Clients');
      }

      // Sheet 3: Pending Matches
      if (pendingMatches.length > 0) {
        const matchesHeaders = [
          'Client ID', 'Client Name', 'TC ID', 'TC Name', 'Status', 'Created At'
        ];
        const matchesRows = pendingMatches.map(match => [
          match.client_id || '',
          match.client?.name || '',
          match.tc_id || '',
          match.training_counsellor?.name || '',
          match.status || '',
          match.created_at ? new Date(match.created_at).toLocaleDateString('en-GB') : ''
        ]);
        const matchesData = [matchesHeaders, ...matchesRows];
        const ws3 = XLSX.utils.aoa_to_sheet(matchesData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Pending Matches');
      }

      // Sheet 4: Consultations
      if (consultations.length > 0) {
        const consultationsHeaders = [
          'ID', 'Client ID', 'Client Name', 'Scheduled At', 'Status', 'Type', 'Created At'
        ];
        const consultationsRows = consultations.map(consultation => [
          consultation.id || '',
          consultation.client_id || '',
          consultation.client?.name || '',
          consultation.scheduled_at ? new Date(consultation.scheduled_at).toLocaleString('en-GB') : '',
          consultation.status || '',
          consultation.type || '',
          consultation.created_at ? new Date(consultation.created_at).toLocaleDateString('en-GB') : ''
        ]);
        const consultationsData = [consultationsHeaders, ...consultationsRows];
        const ws4 = XLSX.utils.aoa_to_sheet(consultationsData);
        XLSX.utils.book_append_sheet(wb, ws4, 'Consultations');
      }

      // Sheet 5: Recent Activity
      try {
        const activityData = await apiService.getActivityLogs({ per_page: 50 });
        const activities = Array.isArray(activityData) ? activityData : activityData.data || [];
        
        if (activities.length > 0) {
          const activityHeaders = ['Description', 'Action', 'Created At'];
          const activityRows = activities.slice(0, 50).map(log => [
            log.description || log.action || '',
            log.action || '',
            log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : ''
          ]);
          const activitySheetData = [activityHeaders, ...activityRows];
          const ws5 = XLSX.utils.aoa_to_sheet(activitySheetData);
          XLSX.utils.book_append_sheet(wb, ws5, 'Recent Activity');
        }
      } catch (err) {
        console.error('Error fetching activity logs for export:', err);
      }

      // Sheet 6: Urgent Items
      const urgentItemsList = [];
      
      if (todayConsultations > 0) {
        urgentItemsList.push({
          type: "consultation",
          message: `${todayConsultations} consultation${todayConsultations > 1 ? 's' : ''} today`,
          details: "Requires attention",
          priority: "high",
          action: "View Schedule",
        });
      }
      
      const stuckClients = allClients.filter(c => c.stage === 'Agreement Pending' && c.status === 'stuck');
      if (stuckClients.length > 0) {
        urgentItemsList.push({
          type: "stuck",
          message: `${stuckClients.length} client${stuckClients.length > 1 ? 's' : ''} stuck in Agreement Pending`,
          details: "No response for over 7 days",
          priority: "medium",
          action: "Review Clients",
        });
      }
      
      const riskClients = allClients.filter(c => c.risk_flags && c.risk_flags !== 'None reported');
      if (riskClients.length > 0) {
        urgentItemsList.push({
          type: "risk",
          message: `${riskClients.length} client${riskClients.length > 1 ? 's' : ''} with risk flag${riskClients.length > 1 ? 's' : ''} need${riskClients.length === 1 ? 's' : ''} follow-up`,
          details: "High priority - requires immediate attention",
          priority: "high",
          action: "View Client",
        });
      }
      
      if (urgentItemsList.length > 0) {
        const urgentHeaders = ['Type', 'Message', 'Details', 'Priority', 'Action'];
        const urgentRows = urgentItemsList.map(item => [
          item.type || '',
          item.message || '',
          item.details || '',
          item.priority || '',
          item.action || ''
        ]);
        const urgentData = [urgentHeaders, ...urgentRows];
        const ws6 = XLSX.utils.aoa_to_sheet(urgentData);
        XLSX.utils.book_append_sheet(wb, ws6, 'Needs Attention');
      }

      // Generate Excel file and download
      const fileName = `dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      // Show success message (you might want to use a toast notification here)
      console.log('Dashboard report exported successfully');
    } catch (err) {
      console.error('Error exporting dashboard report:', err);
      alert('Failed to export dashboard report. Please try again.');
    }
  };

  const StatCard = ({ icon: Icon, label, value, sublabel, color, change }) => (
    <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-gray-600 dark:text-[var(--text-secondary)]">{label}</p>
      </div>
      <div className="pl-1">
        <p className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">{value}</p>
        {(change || sublabel) && (
          <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-1 font-medium">
            {change || sublabel}
          </p>
        )}
      </div>
    </div>
  );

  const UrgentItem = ({ item }) => {
    // Determine the link based on action type
    const getLink = () => {
      if (
        item.action === "View Schedule" ||
        item.action.includes("consultation")
      ) {
        return "/dashboard/consultations";
      } else if (
        item.action === "Review Clients" ||
        item.action.includes("Agreement")
      ) {
        return "/dashboard/pending-matches";
      } else if (
        item.action === "View Client" ||
        item.action.includes("client")
      ) {
        return "/dashboard/clients";
      }
      return null;
    };

    const link = getLink();
    const Component = link ? Link : "div";

    return (
      <Component
        href={link || undefined}
        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
          item.priority === "high"
            ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700"
        }`}
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            item.priority === "high" ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30"
          }`}
        >
          <item.icon
            className={`w-5 h-5 ${
              item.priority === "high" ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
            }`}
          />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] text-sm mb-1">
            {item.message}
          </h4>
          <p className="text-xs text-gray-600 dark:text-[var(--text-secondary)] mb-2">{item.details}</p>
          {link ? (
            <span
              className={`text-xs font-medium flex items-center gap-1 ${
                item.priority === "high"
                  ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  : "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              }`}
            >
              {item.action}
              <ArrowRight className="w-3 h-3" />
            </span>
          ) : (
            <button
              className={`text-xs font-medium flex items-center gap-1 ${
                item.priority === "high"
                  ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  : "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
              }`}
            >
              {item.action}
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </Component>
    );
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white font-bold text-2xl mb-4 animate-pulse"
            style={{ backgroundColor: "#6f1d56" }}
          >
            VT
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, the AuthContext will redirect to login
  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
        {/* Header */}
        <DashboardHeader
          actions={
            <>
              <button 
                onClick={handleExportReport}
                className="px-4 py-2 border border-gray-300 dark:border-[var(--card-border)] text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--card-bg)] rounded-lg hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Export Report
              </button>
              <Link
                href="/dashboard/clients/edit"
                className="px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex items-center gap-2 transition-opacity"
                style={{ backgroundColor: "#6f1d56" }}
              >
                <Plus className="w-4 h-4" />
                Add New Client
              </Link>
            </>
          }
        >
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
              {getUKGreeting()}
            </h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
              <Clock className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              <span className="text-sm font-mono font-semibold text-gray-900 dark:text-gray-100">
                {getUKTime()}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1 font-medium">UK</span>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">
            {getUKDate()} • Overview of all clients and their journey through the system
          </p>
        </DashboardHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-gray-400 dark:text-[var(--text-tertiary)] animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-[var(--text-secondary)]">Loading dashboard...</p>
                </div>
              </div>
            )}
            
            {!loading && (
            <div className="space-y-6">

              {/* Stats Cards - Top Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard
                  icon={Users}
                  label="Total Clients"
                  value={stats.totalClients}
                  change={stats.totalChange}
                  color="#6f1d56"
                />
                <StatCard
                  icon={FileText}
                  label="Application"
                  value={pipelineStages.find(s => s.stage === "Application")?.count || 0}
                  color="#3b82f6"
                />
                <StatCard
                  icon={Video}
                  label="Consultations"
                  value={stats.consultations}
                  sublabel={stats.consultationsNote}
                  color="#6366F1"
                />
                <StatCard
                  icon={UserCheck}
                  label="Pending Match"
                  value={stats.pendingMatch}
                  sublabel={stats.pendingNote}
                  color="#f59e0b"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Agreement"
                  value={pipelineStages.find(s => s.stage === "Agreement")?.count || 0}
                  color="#f97316"
                />
                <StatCard
                  icon={Activity}
                  label="Active Therapy"
                  value={stats.activeTherapy}
                  change={stats.activeChange}
                  color="#10b981"
                />
              </div>

              {/* Needs Attention Section - More Compact */}
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--card-border)] p-5">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setNeedsAttentionExpanded(!needsAttentionExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
                        Needs Attention
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                        {urgentItems.length} items require your attention
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNeedsAttentionExpanded(!needsAttentionExpanded);
                    }}
                  >
                    {needsAttentionExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>
                {needsAttentionExpanded && (
                  <div className="space-y-3 mt-4">
                    {urgentItems.map((item) => (
                      <UrgentItem key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-[var(--card-bg)] rounded-xl shadow-sm border border-gray-200 dark:border-[var(--card-border)] p-5">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setRecentActivityExpanded(!recentActivityExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-400 dark:text-[var(--text-tertiary)]" />
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">
                        Recent Activity
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">Latest updates</p>
                    </div>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRecentActivityExpanded(!recentActivityExpanded);
                    }}
                  >
                    {recentActivityExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>
                {recentActivityExpanded && (
                  <div className="mt-4">
                    <div className="space-y-1">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors cursor-pointer group"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              activity.color === "green"
                                ? "bg-[var(--success-primary)]"
                                : activity.color === "blue"
                                ? "bg-blue-500"
                                : activity.color === "purple"
                                ? "bg-[var(--purple-primary)]"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-[var(--text-primary)]">
                              <span className="font-semibold">
                                {activity.client}
                              </span>{" "}
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[var(--text-tertiary)] mt-0.5">
                              {activity.time}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-[var(--text-tertiary)] group-hover:text-gray-500 dark:group-hover:text-[var(--text-secondary)] flex-shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                    {recentActivity.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                        <Link
                          href="/dashboard/activity-log"
                          className="text-sm font-medium text-[var(--purple-primary)] hover:opacity-80 flex items-center gap-2"
                        >
                          View All Activity
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions - More Compact */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-700 p-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                    Quick Actions
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                    Common tasks for client management
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/clients"
                    className="bg-white dark:bg-[var(--card-bg)] p-5 rounded-xl border-2 border-gray-200 dark:border-[var(--card-border)] hover:border-[var(--purple-primary)] hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[var(--purple-bg)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6 text-[var(--purple-primary)]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                      View All Clients
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      See complete client list with filters
                    </p>
                  </Link>

                  <Link
                    href="/dashboard/consultations"
                    className="bg-white dark:bg-[var(--card-bg)] p-5 rounded-xl border-2 border-gray-200 dark:border-[var(--card-border)] hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Video className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                      Book Consultation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      Schedule initial consultation
                    </p>
                  </Link>

                  <Link
                    href="/dashboard/pending-matches"
                    className="bg-white dark:bg-[var(--card-bg)] p-5 rounded-xl border-2 border-gray-200 dark:border-[var(--card-border)] hover:border-[var(--success-primary)] hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[var(--success-bg)] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 text-[var(--success-primary)]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-[var(--text-primary)] mb-1">
                      Review Matches
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-secondary)]">
                      Approve pending TC matches
                    </p>
                  </Link>
                </div>
              </div>
            </div>
            )}
        </div>
      </div>

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[var(--card-bg)] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-[var(--card-bg)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
                Add New Client
              </h2>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--hover-bg)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-[var(--text-secondary)]" />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--purple-primary)] focus:border-transparent"
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
                    <SearchableSelect
                      required
                      value={newClientForm.gender}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          gender: e.target.value,
                        })
                      }
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Non-binary', label: 'Non-binary' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' }
                      ]}
                      placeholder="Select gender"
                    />
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
                    <SearchableSelect
                      value={newClientForm.sexualOrientation}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          sexualOrientation: e.target.value,
                        })
                      }
                      options={[
                        { value: 'Heterosexual', label: 'Heterosexual' },
                        { value: 'Homosexual', label: 'Homosexual' },
                        { value: 'Bisexual', label: 'Bisexual' },
                        { value: 'Asexual', label: 'Asexual' },
                        { value: 'Prefer not to say', label: 'Prefer not to say' }
                      ]}
                      placeholder="Select orientation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voicemail Permission
                    </label>
                    <SearchableSelect
                      value={newClientForm.voicemailPermission}
                      onChange={(e) =>
                        setNewClientForm({
                          ...newClientForm,
                          voicemailPermission: e.target.value,
                        })
                      }
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                      ]}
                      placeholder="Yes"
                    />
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
    </DashboardLayout>
  );
}
