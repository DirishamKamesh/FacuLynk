import { Designation } from './faculty';

export type UserRole = 'HOD' | 'FACULTY';

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'pending_activation';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  facultyId: string;
  accountStatus: AccountStatus;
  designation?: Designation;
  department?: string;
  phone?: string;
  skills?: string[];
  availability?: string;
  rejectionReason?: string;
  registrationDate?: string;
  isNewlyVerified?: boolean;
  profileCompleted?: boolean;
}

export interface PendingRegistration {
  id: string;
  facultyId: string;
  email: string;
  fullName: string;
  designation: Designation;
  department: string;
  phone: string;
  skills: string[];
  availability: string;
  submittedAt: string;
  status: AccountStatus;
  rejectionReason?: string;
}

export interface InstitutionalVerificationResult {
  valid: boolean;
  message?: string;
  facultyId?: string;
  alreadyRegistered?: boolean;
}
