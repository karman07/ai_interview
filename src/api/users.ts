import http from './http';
import { UpdateProfileDto, User } from '@/types/user';

export const UsersApi = {
  /**
   * Fetch full profile details.
   */
  me: async (): Promise<User> => {
    const { data } = await http.get<User>('/users/me');
    return data;
  },

  /**
   * Update professional details (JSON or Multipart).
   * Note: jobDescription and resumeUrl are no longer supported here.
   */
  updateProfile: async (dto: UpdateProfileDto): Promise<User> => {
    const { data } = await http.patch<User>('/users/profile', dto);
    return data;
  },

  /**
   * Save roll number for a university student.
   */
  setRollNumber: async (rollNumber: string): Promise<User> => {
    const { data } = await http.patch<User>('/users/me', { rollNumber });
    return data;
  },

  /**
   * Register or update the user's FCM push notification token.
   */
  saveFcmToken: async (token: string): Promise<void> => {
    await http.post('/users/me/fcm-token', { token });
  },

  /**
   * Remove all FCM push notification tokens for the user.
   */
  deleteFcmTokens: async (): Promise<void> => {
    await http.delete('/users/me/fcm-token');
  },

  /**
   * Update profile image specifically.
   */
  uploadProfileImage: async (file: File): Promise<User> => {
    const form = new FormData();
    form.append('profileImage', file);
    const { data } = await http.patch<User>('/users/me/profile-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * Sync Firebase verification results to the backend.
   */
  updateVerificationStatus: async (field: 'email', status: boolean): Promise<User> => {
    const { data } = await http.patch<User>('/users/me/verify-status', { field, status });
    return data;
  },

  // ── Admin ──────────────────────────────────────────────────────────────

  /**
   * Fetch all users (admin only).
   */
  adminGetAllUsers: async (): Promise<User[]> => {
    const { data } = await http.get<User[]>('/users/admin/all');
    return data;
  },

  /**
   * Change a user's role (admin only).
   */
  adminSetRole: async (userId: string, role: string): Promise<User> => {
    const { data } = await http.patch<User>(`/users/admin/${userId}/role`, { role });
    return data;
  },

  /**
   * Hard-delete a user (admin only).
   */
  adminDeleteUser: async (userId: string): Promise<void> => {
    await http.delete(`/users/admin/${userId}`);
  },
};
