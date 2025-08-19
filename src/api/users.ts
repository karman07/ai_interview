import http from './http';
import { UpdateProfileDto, User } from '@/types/user';

export const UsersApi = {
  me: async (): Promise<User> => {
    const { data } = await http.get<User>('/users/me');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await http.get<User>(`/users/${id}`);
    return data;
  },

  updateMe: async (dto: UpdateProfileDto): Promise<User> => {
    const { data } = await http.patch<User>('/users/me', dto);
    return data;
  },

  uploadResume: async (file: File): Promise<User> => {
    const form = new FormData();
    form.append('resume', file);
    const { data } = await http.patch<User>('/users/me/resume', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  uploadProfileImage: async (file: File): Promise<User> => {
    const form = new FormData();
    form.append('profileImage', file);
    const { data } = await http.patch<User>('/users/me/profile-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
