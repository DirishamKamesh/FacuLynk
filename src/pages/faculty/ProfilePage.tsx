import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Mail, Phone, Building2, Plus, X, Save, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { activeFacultyId, currentUser, updateUserProfile } = useAuth();
  const { faculty, updateFaculty } = useData();
  const location = useLocation();
  const navigate = useNavigate();

  const isNewlyVerified =
    location.state?.newlyVerified ||
    currentUser?.isNewlyVerified ||
    currentUser?.profileCompleted === false;

  const myProfile = faculty.find((f) => f.id === activeFacultyId || f.email.toLowerCase() === currentUser?.email.toLowerCase()) || faculty[1];

  const [skills, setSkills] = useState<string[]>(myProfile?.skills || ['Curriculum Design']);
  const [newSkill, setNewSkill] = useState('');
  const [phone, setPhone] = useState(myProfile?.phone || currentUser?.phone || '');
  const [office, setOffice] = useState(myProfile?.office || 'Engineering Hall CSE-304');
  const [researchArea, setResearchArea] = useState(myProfile?.researchArea || 'Computer Science & Software Engineering');
  const [isSaved, setIsSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
      setValidationError(null);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async () => {
    if (!phone.trim()) {
      setValidationError('Please provide your institutional contact phone number.');
      return;
    }
    if (!office.trim()) {
      setValidationError('Please specify your office location.');
      return;
    }
    if (!researchArea.trim()) {
      setValidationError('Please specify your primary research focus area.');
      return;
    }
    if (skills.length === 0) {
      setValidationError('Please add at least one specialized skill tag for workload suitability matching.');
      return;
    }

    setValidationError(null);

    if (myProfile) {
      await updateFaculty(myProfile.id, {
        skills,
        phone,
        office,
        researchArea,
      });
    }

    if (currentUser) {
      await updateUserProfile({
        phone,
        skills,
        isNewlyVerified: false,
        profileCompleted: true,
      });
    }

    setIsSaved(true);

    if (isNewlyVerified) {
      setTimeout(() => {
        navigate('/faculty/dashboard');
      }, 1500);
    } else {
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Newly Verified Faculty Notification Banner */}
      {isNewlyVerified && (
        <div className="p-4 bg-teal-50 border-2 border-[#0F766E] rounded-xl flex items-start gap-3 shadow-xs">
          <Sparkles className="w-6 h-6 text-[#0F766E] shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-[#0F766E] uppercase tracking-wider flex items-center gap-1.5">
              <span>Account Verified by HOD — Complete Profile Details</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Welcome to FacuLynk! Your faculty registration has been verified and approved by the Head of Department.
              Please provide your office contact, research focus area, and specialization skill tags below to finalize your profile setup.
            </p>
          </div>
        </div>
      )}

      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty Profile & Specialization Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage skill tags, research areas, office contact details, and statutory capacity rules
          </p>
        </div>
        {isNewlyVerified && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-2xs font-bold uppercase tracking-wider self-start sm:self-auto">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Mandatory Profile Setup Mode
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card title="Profile Summary" className="lg:col-span-1">
          <div className="text-center space-y-3">
            <img
              src={myProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={myProfile?.name || currentUser?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 mx-auto"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900">{myProfile?.name || currentUser?.name}</h3>
              <p className="text-xs text-slate-500">{myProfile?.designation || currentUser?.designation}</p>
              <p className="text-2xs text-[#172554] font-mono font-bold mt-0.5">{currentUser?.facultyId || myProfile?.facultyId}</p>
            </div>
            <Badge status={myProfile?.status || 'Balanced'} />

            <div className="pt-3 border-t border-slate-100 text-left text-xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{myProfile?.email || currentUser?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{office || 'Not provided'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Skills & Details Form */}
        <Card title="Edit Institutional Details & Competency Skills" className="lg:col-span-2">
          <div className="space-y-4 text-sm">
            {validationError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs text-[#B91C1C] font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-800 text-xs mb-1">
                  Phone Number <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="e.g. (555) 019-9821"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#172554]/20 text-xs font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 text-xs mb-1">
                  Office Location <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={office}
                  onChange={(e) => {
                    setOffice(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="e.g. Engineering Building CSE-304"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#172554]/20 text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 text-xs mb-1">
                Primary Research Focus Area <span className="text-rose-600 font-bold">*</span>
              </label>
              <input
                type="text"
                value={researchArea}
                onChange={(e) => {
                  setResearchArea(e.target.value);
                  setValidationError(null);
                }}
                placeholder="e.g. Distributed Systems & Database Architecture"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#172554]/20 text-xs font-medium"
                required
              />
            </div>

            {/* Skill Tags Manager */}
            <div>
              <label className="block font-semibold text-[#1E293B] text-xs mb-1">
                Specialization & Competency Skills <span className="text-rose-600 font-bold">*</span> (Used for AI Suitability Matrix Matching)
              </label>

              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Database Systems, Machine Learning)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#172554]/20"
                />
                <Button size="sm" variant="outline" onClick={handleAddSkill} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-[#E2E8F0] rounded-lg min-h-[60px]">
                {skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skill tags added yet. Please add at least one tag.</p>
                ) : (
                  skills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#1E293B] shadow-2xs"
                    >
                      {sk}
                      <button
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {isSaved ? (
                <div className="flex items-center gap-2 text-xs font-bold text-[#15803D] bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Profile completed and saved successfully! {isNewlyVerified && 'Redirecting to dashboard...'}</span>
                </div>
              ) : (
                <span className="text-2xs text-[#64748B]">Designation quota: {myProfile?.maxWorkloadHours || 20} Max Hours</span>
              )}
              <Button
                variant="teal"
                onClick={handleSaveProfile}
                icon={isNewlyVerified ? <ArrowRight className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                className="w-full sm:w-auto justify-center"
              >
                {isNewlyVerified ? 'Complete & Proceed to Dashboard' : 'Save Profile Changes'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
