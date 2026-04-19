import { baseApi } from '../../store/baseApi';
import { User } from '../../types';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], { role?: string; status?: string }>({
      query: (params) => ({ url: '/users', params }),
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation<User, { id: string; status: string }>({
      query: ({ id, status }) => ({ url: `/users/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    updateProfile: builder.mutation<User, { name?: string; agency?: string; avatarUrl?: string }>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    updateUserRole: builder.mutation<User, { id: string; role: string }>({
      query: ({ id, role }) => ({ url: `/users/${id}/role`, method: 'PATCH', body: { role } }),
      invalidatesTags: ['User'],
    }),
    requestRole: builder.mutation<{ message: string }, 'agent' | 'owner'>({
      query: (role) => ({ url: '/users/me/request-role', method: 'POST', body: { role } }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useUpdateProfileMutation,
  useUpdateUserRoleMutation,
  useRequestRoleMutation,
} = usersApi;
