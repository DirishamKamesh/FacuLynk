import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bell,
  UserCheck,
  ShieldAlert,
  LogOut,
  ChevronDown,
  Building2,
  User,
  Menu,
  X,
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart2,
  Grid,
  Sliders,
  PieChart,
  GitPullRequest,
  ShieldCheck,
  Gauge,
  Calendar,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

export const Header: React.FC = () => {
  const { currentUser, role, activeFacultyId, setActiveFacultyId, pendingRegistrations, logout, login } = useAuth();
  const { faculty } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeFaculty = faculty.find((f) => f.id === activeFacultyId);
  const overloadedCount = faculty.filter((f) => f.status === 'Overloaded').length;
  const pendingCount = pendingRegistrations.length;

  const handleRoleToggle = async (newRole: 'HOD' | 'FACULTY', targetFacId?: string) => {
    setShowRoleMenu(false);
    setMobileDrawerOpen(false);
    
    // Auto-switching roles is a security risk in production.
    // Force user to logout and login again.
    await logout();
    navigate('/login');
  };

  const handleLogout = () => {
    setMobileDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const hodNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
    {
      label: 'Faculty Verification',
      path: '/hod/verification',
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Faculty Directory', path: '/hod/faculty', icon: Users },
    { label: 'Task Management', path: '/hod/tasks', icon: CheckSquare },
    { label: 'Workload Matrix', path: '/hod/workload', icon: BarChart2 },
    { label: 'Faculty Matching', path: '/hod/assignments', icon: Grid },
    { label: 'Workload Recommendations', path: '/hod/recommendations', icon: GitPullRequest },
    { label: 'Scenario Simulator', path: '/hod/simulator', icon: Sliders },
    { label: 'Department Analytics', path: '/hod/analytics', icon: PieChart },
  ];

  const facultyNavItems: NavItem[] = [
    { label: 'My Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'My Assigned Tasks', path: '/faculty/tasks', icon: CheckSquare },
    { label: 'My Workload Status', path: '/faculty/workload', icon: Gauge },
    { label: 'Weekly Schedule', path: '/faculty/schedule', icon: Calendar },
    { label: 'Faculty Profile', path: '/faculty/profile', icon: User },
  ];

  const navItems = role === 'HOD' ? hodNavItems : facultyNavItems;

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E2E8F0] px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shadow-2xs">
        {/* Left Side: Mobile Menu Button & Brand Title */}
        <div className="flex items-center gap-2.5">
          {/* Hamburger Menu Toggle on Mobile */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-[#172554] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6 text-[#172554]" />
          </button>

          {/* Institution Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#172554] text-white flex items-center justify-center font-bold text-sm sm:text-base tracking-wider shadow-2xs border border-[#172554] shrink-0">
              OU
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1E293B] tracking-tight flex items-center gap-1.5">
                FacuLynk
                <span className="hidden md:inline bg-slate-100 text-slate-700 font-medium text-xs px-2 py-0.5 rounded border border-[#E2E8F0]">
                  Dept. of CS & Engineering
                </span>
              </h1>
              <p className="text-2xs text-[#64748B] hidden sm:block">Institutional Workload Management System v2.4</p>
            </div>
          </div>
        </div>

        {/* Right Side Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Alerts Button */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsMenu(!showAlertsMenu)}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-600 relative transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Institutional Alerts"
            >
              <Bell className="w-5 h-5 text-[#334155]" />
              {overloadedCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B91C1C] ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showAlertsMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-[#E2E8F0] rounded-xl shadow-lg p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
                    Workload Alerts ({overloadedCount})
                  </span>
                  <span className="text-2xs text-slate-400">Live Status</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {faculty
                    .filter((f) => f.status === 'Overloaded')
                    .map((f) => (
                      <div key={f.id} className="p-2.5 bg-red-50/70 border border-red-200 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#B91C1C]">{f.name}</p>
                          <p className="text-2xs text-red-700">
                            {f.currentWorkloadHours} hrs / {f.maxWorkloadHours} hrs limit (+{f.currentWorkloadHours - f.maxWorkloadHours} hrs over)
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setShowAlertsMenu(false);
                            navigate('/hod/recommendations');
                          }}
                          className="text-2xs font-semibold bg-[#B91C1C] text-white px-2.5 py-1 rounded hover:bg-red-800 transition-colors cursor-pointer"
                        >
                          Rebalance
                        </button>
                      </div>
                    ))}
                  {overloadedCount === 0 && (
                    <p className="text-xs text-slate-500 py-3 text-center">All faculty workloads are balanced within quota limits.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Dropdown (Visible on Desktop & Mobile) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-md border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-semibold text-[#1E293B] cursor-pointer min-h-[44px]"
            >
              <Building2 className="w-3.5 h-3.5 text-[#172554]" />
              <span className="hidden sm:inline">Role: </span>
              <strong className="text-[#172554]">{role === 'HOD' ? 'HOD' : 'Faculty'}</strong>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-2 z-50">
                <div className="text-2xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Role Switcher
                </div>
                <button
                  onClick={() => handleRoleToggle('HOD')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors min-h-[44px] cursor-pointer ${
                    role === 'HOD' ? 'bg-[#172554]/10 text-[#172554] border border-[#172554]/20 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#172554]" />
                    <div>
                      <p className="leading-none font-bold text-[#172554]">HOD View</p>
                      <p className="text-2xs text-slate-500 font-normal mt-0.5">Dr. Arthur Pendelton (HOD)</p>
                    </div>
                  </div>
                  {role === 'HOD' && <span className="w-2 h-2 rounded-full bg-[#172554]" />}
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <p className="text-2xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Faculty Profiles
                  </p>
                  {faculty.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleRoleToggle('FACULTY', f.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                        role === 'FACULTY' && activeFacultyId === f.id
                          ? 'bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate leading-none">{f.name}</p>
                        <p className="text-2xs text-slate-400 font-normal">{f.designation}</p>
                      </div>
                      {role === 'FACULTY' && activeFacultyId === f.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center">
              {role === 'HOD' ? (
                <User className="w-4 h-4 text-slate-600" />
              ) : (
                <img
                  src={activeFaculty?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={activeFaculty?.name || 'Faculty'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {role === 'HOD' ? 'Dr. Arthur Pendelton' : activeFaculty?.name}
              </p>
              <p className="text-2xs text-slate-500">{role === 'HOD' ? 'Head of Department' : activeFaculty?.designation}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Sidebar Content */}
          <div className="relative w-80 max-w-[85vw] bg-[#1E2A55] text-white flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-[#162042] border-b border-[#2B3A6F] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm">
                  OU
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">FacuLynk</h2>
                  <p className="text-2xs text-teal-300 font-medium">CS & Engineering Department</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current User Profile Card in Drawer */}
            <div className="p-4 bg-[#28386E]/60 border-b border-[#2B3A6F] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 border border-teal-400 overflow-hidden shrink-0 flex items-center justify-center">
                {role === 'HOD' ? (
                  <User className="w-5 h-5 text-slate-700" />
                ) : (
                  <img
                    src={activeFaculty?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt="User Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">
                  {role === 'HOD' ? 'Dr. Arthur Pendelton' : activeFaculty?.name}
                </p>
                <p className="text-2xs text-teal-300 font-semibold">
                  {role === 'HOD' ? 'Head of Department (HOD)' : activeFaculty?.designation}
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              <p className="text-3xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                {role === 'HOD' ? 'HOD Management Portal' : 'Faculty Personal Portal'}
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-white text-[#1E2A55] font-bold shadow-sm border-l-4 border-[#0F766E]'
                        : 'text-slate-200 hover:bg-[#28386E]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className="w-4 h-4 shrink-0 text-[#0F766E]" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && (
                        <span className="px-2 py-0.5 text-3xs font-extrabold bg-amber-500 text-slate-950 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#2B3A6F] bg-[#162042] space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold min-h-[44px] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

