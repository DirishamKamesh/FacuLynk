import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, PendingRegistration, UserRole, AccountStatus, InstitutionalVerificationResult } from '../types/auth';
import { authService } from '../services/authService';
import { Designation } from '../types/faculty';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  accountStatus: AccountStatus | null;
  activeFacultyId: string;
  setActiveFacultyId: (id: string) => void;
  pendingRegistrations: PendingRegistration[];
  login: (idOrEmail: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  activateHodAccount: (data: { hodId: string; fullName: string; email: string; department: string }) => Promise<AuthUser>;
  verifyInstitutionalId: (facultyId: string, email: string) => Promise<InstitutionalVerificationResult>;
  registerFaculty: (data: {
    facultyId: string;
    email: string;
    fullName: string;
    designation: Designation;
    department: string;
    phone: string;
    skills: string[];
    availability: string;
  }) => Promise<PendingRegistration>;
  approveFaculty: (regId: string) => Promise<AuthUser>;
  rejectFaculty: (regId: string, reason: string) => Promise<PendingRegistration>;
  refreshPendingRegistrations: () => Promise<void>;
  checkApprovalStatus: () => Promise<AccountStatus>;
  updateUserProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [activeFacultyId, setActiveFacultyId] = useState<string>('');
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          if (user.role === 'FACULTY') {
            setActiveFacultyId(user.id);
          }
        }
      } catch (e) {
        console.error('Failed to restore session', e);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeAuth();
  }, []);

  const refreshPendingRegistrations = async () => {
    try {
      const list = await authService.getPendingRegistrations();
      setPendingRegistrations(list);
    } catch (e) {
      console.error('Failed to fetch pending registrations', e);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'HOD') {
      refreshPendingRegistrations();
    }
  }, [currentUser]);

  const login = async (idOrEmail: string, password: string): Promise<AuthUser> => {
    const user = await authService.login(idOrEmail, password);
    setCurrentUser(user);
    if (user.role === 'FACULTY') {
      setActiveFacultyId(user.id);
    } else {
      setActiveFacultyId('');
    }
    return user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setCurrentUser(null);
      setActiveFacultyId('');
      setPendingRegistrations([]);
    }
  };

  const activateHodAccount = async (data: { hodId: string; fullName: string; email: string; department: string }): Promise<AuthUser> => {
    const user = await authService.activateHodAccount(data);
    setCurrentUser(user);
    return user;
  };

  const verifyInstitutionalId = async (facultyId: string, email: string): Promise<InstitutionalVerificationResult> => {
    // Ideally this connects to an endpoint checking if faculty ID exists
    // But since backend might not expose it publicly, we either do it or assume true
    // For now, assume it's valid if backend validation is deferred to registration step
    return { valid: true, facultyId: facultyId.trim().toUpperCase() };
  };

  const registerFaculty = async (data: {
    facultyId: string;
    email: string;
    fullName: string;
    designation: Designation;
    department: string;
    phone: string;
    skills: string[];
    availability: string;
  }): Promise<PendingRegistration> => {
    const result = await authService.registerFaculty(data);
    setCurrentUser(result.user);
    setActiveFacultyId(result.user.id);
    return result.registration;
  };

  const approveFaculty = async (regId: string): Promise<AuthUser> => {
    const user = await authService.approveRegistration(regId);
    await refreshPendingRegistrations();
    return user;
  };

  const rejectFaculty = async (regId: string, reason: string): Promise<PendingRegistration> => {
    const reg = await authService.rejectRegistration(regId, reason);
    await refreshPendingRegistrations();
    return reg;
  };

  const checkApprovalStatus = async (): Promise<AccountStatus> => {
    if (!currentUser) return 'PENDING';
    try {
      // In a real API we could ping `/api/auth/me` to refresh user state
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        return user.accountStatus;
      }
    } catch (e) {
      console.error(e);
    }
    return currentUser.accountStatus;
  };

  const updateUserProfile = async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    if (!currentUser) throw new Error('No logged in user');
    // Actual implementation will use facultyService, this is a placeholder.
    // In Phase 4 we will connect this to `PUT /api/faculty/me/profile` via facultyService
    return currentUser;
  };

  const isAuthenticated = !!currentUser;
  const role = currentUser?.role || null;
  const accountStatus = currentUser?.accountStatus || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        accountStatus,
        activeFacultyId,
        setActiveFacultyId,
        pendingRegistrations,
        login,
        logout,
        activateHodAccount,
        verifyInstitutionalId,
        registerFaculty,
        approveFaculty,
        rejectFaculty,
        refreshPendingRegistrations,
        checkApprovalStatus,
        updateUserProfile,
        isInitializing
      }}
    >
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
