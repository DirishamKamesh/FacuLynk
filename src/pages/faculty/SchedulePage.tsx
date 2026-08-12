import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Calendar, Clock } from 'lucide-react';

interface ScheduleSlot {
  day: string;
  time: string;
  title: string;
  code: string;
  type: 'Lecture' | 'Lab' | 'Office Hours' | 'Admin Meeting';
  room: string;
}

export const SchedulePage: React.FC = () => {
  const { activeFacultyId } = useAuth();
  const { faculty, tasks } = useData();

  const myProfile = faculty.find((f) => f.id === activeFacultyId) || faculty[1];

  const scheduleSlots: ScheduleSlot[] = [
    { day: 'Mon', time: '09:00 - 10:15 AM', title: 'CS 1313 Programming for Non-Majors', code: 'CS 1313-001', type: 'Lecture', room: 'G.L. Cross Hall 0123' },
    { day: 'Mon', time: '01:30 - 03:00 PM', title: 'Department Faculty Committee', code: 'ADMIN-DEPT', type: 'Admin Meeting', room: 'Engineering Conference Room B' },
    { day: 'Tue', time: '10:30 - 12:00 PM', title: 'Student Advising Office Hours', code: 'OH-CSE', type: 'Office Hours', room: myProfile?.office || 'Engineering Hall 314' },
    { day: 'Wed', time: '09:00 - 10:15 AM', title: 'CS 1313 Programming for Non-Majors', code: 'CS 1313-001', type: 'Lecture', room: 'G.L. Cross Hall 0123' },
    { day: 'Wed', time: '02:00 - 04:00 PM', title: 'CS 4013 Database Systems Lab', code: 'CS 4013-002', type: 'Lab', room: 'Engineering Lab 0216' },
    { day: 'Thu', time: '10:30 - 12:00 PM', title: 'Student Advising Office Hours', code: 'OH-CSE', type: 'Office Hours', room: myProfile?.office || 'Engineering Hall 314' },
    { day: 'Fri', time: '09:00 - 10:15 AM', title: 'CS 1313 Programming for Non-Majors', code: 'CS 1313-001', type: 'Lecture', room: 'G.L. Cross Hall 0123' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E2E8F0]">
        <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Weekly Academic Timetable</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Teaching schedule, lab supervision slots, office hours, and administrative meetings
        </p>
      </div>

      <Card title="Weekly Grid View (Fall 2026)">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((d) => {
            const daySlots = scheduleSlots.filter((s) => s.day === d);
            return (
              <div key={d} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                <div className="pb-2 border-b border-slate-200 text-center">
                  <span className="font-bold text-slate-900 text-sm uppercase">{d}</span>
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-2xs text-slate-400 py-8 text-center italic">No scheduled classes</p>
                ) : (
                  daySlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200/90 rounded text-xs space-y-1 shadow-2xs"
                    >
                      <span className="text-2xs font-bold text-slate-500 font-mono block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#172554]" />
                        {slot.time}
                      </span>
                      <p className="font-bold text-slate-900 leading-tight">{slot.title}</p>
                      <p className="text-2xs text-slate-500 font-mono">{slot.code}</p>
                      <p className="text-2xs text-slate-400 italic mt-1">{slot.room}</p>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
