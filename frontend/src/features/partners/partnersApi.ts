import { baseApi } from '../../store/baseApi';

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  order: number;
  createdAt: string;
}

export const partnersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartners: builder.query<Partner[], void>({
      query: () => '/partners',
      providesTags: ['Partner'],
    }),
    createPartner: builder.mutation<Partner, Partial<Partner>>({
      query: (body) => ({ url: '/partners', method: 'POST', body }),
      invalidatesTags: ['Partner'],
    }),
    updatePartner: builder.mutation<Partner, { id: string; data: Partial<Partner> }>({
      query: ({ id, data }) => ({ url: `/partners/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Partner'],
    }),
    deletePartner: builder.mutation<void, string>({
      query: (id) => ({ url: `/partners/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Partner'],
    }),
  }),
});

export const {
  useGetPartnersQuery,
  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useDeletePartnerMutation,
} = partnersApi;
