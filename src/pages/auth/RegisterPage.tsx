import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Designation } from '../../types/faculty';
import { GraduationCap, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const SKILL_OPTIONS = [
  'Database Systems',
  'SQL Architecture',
  'Distributed Systems',
  'Programming Languages',
  'Algorithms',
  'Curriculum Design',
  'Software Engineering',
  'System Architecture',
  'Mentorship',
  'Probability & Statistics',
  'Python Analytics',
  'R Programming',
  'Computer Systems',
  'Assembly',
  'C/C++ Programming',
  'Cybersecurity',
  'Cryptography',
  'Network Protocols',
  'Artificial Intelligence',
  'Deep Learning',
  'Computer Vision',
];

export const RegisterPage: React.FC = () => {
  const { verifyInstitutionalId, registerFaculty } = useAuth();
  const navigate = useNavigate();

  // Step state: 1 = Verification, 2 = Details Form
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Fields
  const [facultyId, setFacultyId] = useState('');
  const [email, setEmail] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Step 2 Fields
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState<Designation>('Assistant Professor');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Database Systems', 'Software Engineering']);
  const [availability, setAvailability] = useState('20 hrs/week statutory capacity');
  const [step2Error, setStep2Error] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const handleVerifyStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyId.trim() || !email.trim()) {
      setStep1Error('Please fill in both Faculty ID and Institutional Email.');
      return;
    }

    setStep1Error(null);
    setVerifying(true);

    try {
      const res = await verifyInstitutionalId(facultyId, email);
      if (!res.valid) {
        setStep1Error(res.message || 'Institutional ID not recognized. Please contact your department administration.');
      } else {
        setFacultyId(res.facultyId || facultyId.toUpperCase());
        setStep(2);
      }
    } catch (err: any) {
      setStep1Error(err.message || 'Verification failed. Please check your Institutional ID.');
    } finally {
      setVerifying(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setStep2Error('Please enter your full name.');
      return;
    }
    if (password && password !== confirmPassword) {
      setStep2Error('Passwords do not match.');
      return;
    }

    setStep2Error(null);
    setRegistering(true);

    try {
      await registerFaculty({
        facultyId,
        email,
        fullName,
        designation,
        department,
        phone: phone || '(555) 019-2030',
        skills: selectedSkills.length > 0 ? selectedSkills : ['Curriculum Design'],
        availability,
        password,
      });

      navigate('/pending-approval');
    } catch (err: any) {
      setStep2Error(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-[#1E293B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-14 h-14 bg-[#172554] text-white rounded-xl mx-auto flex items-center justify-center font-bold text-2xl border border-[#172554] shadow-xs">
          <GraduationCap className="w-8 h-8 text-teal-400" />
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-[#1E293B] tracking-tight">
          Faculty Registration
        </h1>
        <p className="mt-1 text-xs text-[#64748B] font-medium">
          Register using your institutional faculty identity.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xs border border-[#E2E8F0] rounded-xl sm:px-10 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-[#172554] text-white' : 'bg-emerald-100 text-[#15803D]'
                }`}
              >
                {step === 1 ? '1' : <CheckCircle2 className="w-4 h-4 text-[#15803D]" />}
              </span>
              <span className="text-xs font-bold text-[#1E293B]">
                Step 1: Institutional Identity
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-[#172554] text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </span>
              <span
                className={`text-xs font-bold ${
                  step === 2 ? 'text-[#1E293B]' : 'text-slate-400'
                }`}
              >
                Step 2: Faculty Details
              </span>
            </div>
          </div>

          {/* STEP 1: Institutional Identity Verification */}
          {step === 1 && (
            <form onSubmit={handleVerifyStep1} className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-2xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Faculty Verification Policy</p>
                  <p className="mt-0.5 text-amber-800">
                    Registration is restricted to authorized faculty members possessing a valid university-issued Faculty ID.
                  </p>
                </div>
              </div>

              {step1Error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-[#B91C1C]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{step1Error}</span>
                </div>
              )}

              <div>
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                  Faculty / Employee ID
                </label>
                <input
                  type="text"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  placeholder="e.g. FAC-1009"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B] bg-slate-50/50 uppercase"
                  required
                />
                <p className="text-3xs text-slate-400 mt-1">
                  Type your assigned university ID (e.g., FAC-1009)
                </p>
              </div>

              <div>
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty@university.edu"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B] bg-slate-50/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying}
                className="w-full py-2.5 px-4 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-sm rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {verifying ? 'Verifying Identity...' : 'Verify Institutional ID'}
              </button>

              <div className="pt-3 border-t border-[#E2E8F0] text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Detailed Registration Form */}
          {step === 2 && (
            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-[#15803D]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Institutional Identity <strong>{facultyId}</strong> verified successfully.
                </span>
              </div>

              {step2Error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-[#B91C1C]">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{step2Error}</span>
                </div>
              )}

              {/* Readonly verified fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Verified Faculty ID</span>
                  <span className="text-xs font-bold text-[#172554] font-mono">{facultyId}</span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Verified Institutional Email</span>
                  <span className="text-xs font-medium text-slate-800 truncate block">{email}</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                  Full Name (with title)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Alan Turing"
                  className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                  required
                />
              </div>

              {/* Designation & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value as Designation)}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B] bg-white"
                  >
                    <option value="Assistant Professor">Assistant Professor (20h max)</option>
                    <option value="Associate Professor">Associate Professor (16h max)</option>
                    <option value="Professor">Professor (10h max)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                    required
                  />
                </div>
              </div>

              {/* Phone & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 019-2834"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                    Weekly Capacity / Availability
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172554] text-[#1E293B]"
                  />
                </div>
              </div>

              {/* Skills Selection */}
              <div>
                <label className="block text-2xs font-bold text-[#1E293B] uppercase tracking-wider mb-1">
                  Skills & Areas of Expertise
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {SKILL_OPTIONS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`text-3xs font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#172554] text-white border border-[#172554]'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="flex-1 py-2.5 px-4 bg-[#172554] hover:bg-[#1E3A8A] text-white font-bold text-sm rounded-lg transition-colors border border-[#172554] shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {registering ? 'Submitting Registration...' : 'Submit Faculty Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
