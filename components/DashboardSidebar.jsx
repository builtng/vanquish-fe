"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import apiService from '@/lib/api';
import {
  Home,
  Video,
  UserCheck,
  Users,
  CalendarDays,
  Building2,
  ClipboardList,
  Activity,
  Settings,
  LogOut,
  Menu,
  Info
} from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [consultationCounts, setConsultationCounts] = useState({
    today: 0,
    upcoming: 0,
    completed: 0
  });
  const [pendingMatchesCount, setPendingMatchesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Transform API consultation data to match component structure
  const transformConsultationData = (consultations) => {
    if (!Array.isArray(consultations)) {
      return [];
    }
    
    return consultations.map(consultation => ({
      id: consultation.id,
      date: consultation.scheduled_at ? consultation.scheduled_at.split('T')[0] : null,
      status: consultation.status === 'scheduled' ? 'Booked' : consultation.status === 'completed' ? 'Completed' : consultation.status === 'no_show' ? 'No Show' : consultation.status === 'cancelled' ? 'Cancelled' : consultation.status,
    }));
  };

  // Fetch sidebar counts from backend
  useEffect(() => {
    const fetchSidebarCounts = async () => {
      try {
        const [consultationsData, pendingCount] = await Promise.all([
          apiService.getConsultations(),
          apiService.getPendingMatchesCount()
        ]);
        
        // Transform consultations data
        const consultationsArray = Array.isArray(consultationsData) ? consultationsData : (consultationsData?.data || []);
        const transformedConsultations = transformConsultationData(consultationsArray);
        
        // Calculate counts exactly like the consultations page
        const today = new Date().toISOString().split('T')[0];
        const todayCount = transformedConsultations.filter(c => c.date === today && c.status === 'Booked').length;
        const upcomingCount = transformedConsultations.filter(c => c.status === 'Booked').length;
        const completedCount = transformedConsultations.filter(c => c.status === 'Completed').length;
        
        setConsultationCounts({
          today: todayCount,
          upcoming: upcomingCount,
          completed: completedCount
        });
        setPendingMatchesCount(pendingCount || 0);
      } catch (err) {
        console.error('Error fetching sidebar counts:', err);
        // Set defaults on error
        setConsultationCounts({ today: 0, upcoming: 0, completed: 0 });
        setPendingMatchesCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchSidebarCounts, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'overview', icon: Home, label: 'Overview', href: '/dashboard' },
    { 
      id: 'consultations', 
      icon: Video, 
      label: 'Consultations', 
      badge: consultationCounts.upcoming,
      href: '/dashboard/consultations' 
    },
    { id: 'matches', icon: UserCheck, label: 'Pending Matches', badge: pendingMatchesCount, href: '/dashboard/pending-matches' },
    { id: 'tcs', icon: Users, label: 'Practitioners', href: '/dashboard/training-counsellors' },
    { id: 'inductions', icon: CalendarDays, label: 'Inductions', href: '/dashboard/inductions' },
    { id: 'providers', icon: Building2, label: 'Training Providers', href: '/dashboard/training-providers' },
    { id: 'clients', icon: ClipboardList, label: 'All Clients', href: '/dashboard/clients' },
    { id: 'activity', icon: Activity, label: 'Activity Log', href: '/dashboard/activity-log' },
    { id: 'color-guide', icon: Info, label: 'Color Guide', href: '/dashboard/color-guide' }
  ];

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-30`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#6f1d56' }}>
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
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = pathname === item.href || 
            (item.id === 'matches' && pathname?.startsWith('/dashboard/pending-matches')) ||
            (item.id === 'clients' && pathname?.startsWith('/dashboard/client-details')) ||
            (item.id === 'tcs' && pathname?.startsWith('/dashboard/training-counsellors/details'));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-purple-100 text-purple-900' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-white text-xs rounded-full ${
                      item.badge > 0 ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
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
        <Link
          href="/dashboard/settings"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            pathname === '/dashboard/settings'
              ? 'bg-purple-100 text-purple-900'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
        </Link>

        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

