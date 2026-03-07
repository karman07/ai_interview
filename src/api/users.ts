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
};
