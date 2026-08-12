import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  BarChart2,
  Grid,
  Sliders,
  PieChart,
  Calendar,
  Gauge,
  User,
  GraduationCap,
  ChevronRight,
  GitPullRequest,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { role, pendingRegistrations } = useAuth();

  const pendingCount = pendingRegistrations.length;

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

  const items = role === 'HOD' ? hodNavItems : facultyNavItems;

  return (
    <aside className="hidden lg:flex w-64 bg-[#1E2A55] text-slate-100 flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-[#2B3A6F] shadow-sm select-none">
      {/* Role Context Bar */}
      <div className="p-4 bg-[#28386E]/60 border-b border-[#2B3A6F] flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center shrink-0 border border-teal-500/30">
          <GraduationCap className="w-4 h-4" />
        </div>
        <div>
          <p className="text-2xs font-bold text-teal-300">
            {role === 'HOD' ? 'HOD Management Portal' : 'Faculty Personal Portal'}
          </p>
          <p className="text-xs font-semibold text-white">
            {role === 'HOD' ? 'Department Administration' : 'Instructor Dashboard'}
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-[#1E2A55] font-bold shadow-2xs border-l-4 border-[#0F766E]'
                    : 'text-slate-200/90 hover:bg-[#28386E]/60 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-3xs font-extrabold bg-amber-500 text-slate-950 rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#2B3A6F] bg-[#162042] text-2xs text-slate-300/80">
        <p className="font-semibold text-white">University Accreditation System</p>
        <p className="mt-0.5 text-slate-400">Faculty Workload Rules: Prof (10h), Assoc (16h), Asst (20h)</p>
      </div>
    </aside>
  );
};


