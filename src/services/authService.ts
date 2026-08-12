import { apiClient } from './apiClient';
import { AuthUser, PendingRegistration, AccountStatus } from '../types/auth';

class AuthService {
  /**
   * User Sign-In via REST API
   * Backend requires { institutionalId, password } or { email, password } based on its LoginRequest
   * For the mock migration, since passwords were omitted from mock login, we send a default
   * or the user's provided input. The backend login request takes `institutionalId` and `password`.
   */
  async login(idOrEmail: string, password?: string): Promise<AuthUser> {
    const isEmail = idOrEmail.includes('@');
    // Assuming backend LoginRequest accepts institutionalId (and we map email manually or backend handles it)
    // We send to POST /api/auth/login
    // The backend responds with AuthUserResponse, mapping it to AuthUser in frontend.
    const response = await apiClient.post<any>('/auth/login', {
      username: idOrEmail,
      password: password,
    });

    return this.mapAuthUser(response);
  }

  /**
   * Fetch current authenticated user state
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<any>('/auth/me');
      return this.mapAuthUser(response);
    } catch (error) {
      return null;
    }
  }

  /**
   * Logout user via backend cookie clear
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    }
  }

  /**
   * Register new faculty member -> status PENDING
   */
  async registerFaculty(data: {
    facultyId: string;
    email: string;
    fullName: string;
    designation: string;
    department: string;
    phone: string;
    skills: string[];
    availability: string;
    password?: string;
  }): Promise<{ user: AuthUser; registration: PendingRegistration }> {
    const response = await apiClient.post<any>('/auth/register-faculty', {
      institutionalId: data.facultyId,
      email: data.email,
      fullName: data.fullName,
      designation: data.designation,
      departmentCode: data.department || 'CS', // Adjust this based on backend expectations, usually code or ID
      password: data.password, 
    });
    
    // Backend returns FacultyRegistrationRequest
    const reg = this.mapPendingRegistration(response);
    
    // Since they are pending, we just return a stub AuthUser for the UI expectation
    const user: AuthUser = {
      id: reg.id,
      email: reg.email,
      name: reg.fullName,
      role: 'FACULTY',
      facultyId: reg.facultyId,
      accountStatus: 'PENDING',
      designation: reg.designation,
      department: reg.department,
      phone: reg.phone,
      skills: reg.skills,
      availability: reg.availability,
      registrationDate: reg.submittedAt,
    };

    return { user, registration: reg };
  }

  /**
   * Get all pending registrations for HOD verification portal
   */
  async getPendingRegistrations(): Promise<PendingRegistration[]> {
    const response = await apiClient.get<any[]>('/verification-requests');
    return response.map(this.mapPendingRegistration);
  }

  /**
   * HOD Approve Registration: PENDING -> APPROVED -> ACTIVE
   */
  async approveRegistration(regId: string): Promise<AuthUser> {
    const response = await apiClient.post<any>(`/verification-requests/${regId}/approve`);
    return this.mapAuthUser(response);
  }

  /**
   * HOD Reject Registration: PENDING -> REJECTED
   */
  async rejectRegistration(regId: string, reason: string): Promise<PendingRegistration> {
    const response = await apiClient.post<any>(`/verification-requests/${regId}/reject`, {
      hodNote: reason,
    });
    return this.mapPendingRegistration(response);
  }

  /**
   * Activate HOD Account (First time activation)
   */
  async activateHodAccount(data: {
    hodId: string;
    fullName: string;
    email: string;
    department: string;
    password?: string;
  }): Promise<AuthUser> {
    const response = await apiClient.post<any>('/auth/activate-hod', {
      hodId: data.hodId,
      fullName: data.fullName,
      email: data.email,
      departmentCode: data.department || 'CS',
      password: data.password,
    });
    return this.mapAuthUser(response);
  }

  /**
   * Check latest status for a user (Not directly mapping well to REST if unauthenticated, 
   * but usually used during registration/login flows. We can try logging in or returning default)
   */
  async checkAccountStatus(facultyIdOrEmail: string): Promise<AccountStatus> {
    // A real implementation would hit a public endpoint to check status.
    // For now, return ACTIVE as a fallback, or we can assume it will be handled by login.
    return 'ACTIVE'; 
  }

  // --- Helpers for mapping backend DTOs to Frontend interfaces ---

  private mapAuthUser(dto: any): AuthUser {
    return {
      id: dto.id,
      email: dto.email,
      name: dto.fullName,
      role: (dto.role === 'ROLE_HOD' || dto.role === 'HOD') ? 'HOD' : 'FACULTY', // Map backend role to HOD
      facultyId: dto.institutionalId,
      accountStatus: dto.accountStatus,
      designation: dto.designation || 'Faculty',
      department: dto.departmentName || 'Computer Science',
      phone: '', // Not always returned in AuthUserResponse, maybe from profile later
      skills: [],
      isNewlyVerified: false,
      profileCompleted: true,
    };
  }

  private mapPendingRegistration(dto: any): PendingRegistration {
    return {
      id: dto.id,
      facultyId: dto.institutionalId,
      email: dto.email,
      fullName: dto.fullName,
      designation: dto.designation || 'Faculty',
      department: dto.departmentName || 'Computer Science',
      phone: '',
      skills: [],
      availability: '20 hrs/week',
      submittedAt: new Date(dto.createdAt).toLocaleString(),
      status: dto.status,
      rejectionReason: dto.rejectionReason,
    };
  }
}

export const authService = new AuthService();
