import { baseApi } from '../../store/baseApi';

export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  lga: string | null;
  state: string;
  description: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  totalUnits: number;
  availableUnits: number;
  progress: number;
  completionDate: string | null;
  status: string;
  images: string[];
  features: string[];
  videoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectPayload = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], { search?: string }>({
      query: (params) => ({ url: '/projects', params }),
      providesTags: ['Project'],
    }),
    getProjectById: builder.query<Project, string>({
      query: (id) => `/projects/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<Project, CreateProjectPayload>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: string; data: UpdateProjectPayload }>({
      query: ({ id, data }) => ({ url: `/projects/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<void, string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
