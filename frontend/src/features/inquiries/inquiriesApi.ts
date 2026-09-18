import { baseApi } from '../../store/baseApi';
import { Inquiry, InquiryMessage } from '../../types';

export const inquiriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInquiries: builder.query<Inquiry[], { status?: string }>({
      query: (params) => ({ url: '/inquiries', params }),
      providesTags: ['Inquiry'],
    }),
    getMyInquiries: builder.query<Inquiry[], void>({
      query: () => '/inquiries/mine',
      providesTags: ['Inquiry'],
    }),
    createInquiry: builder.mutation<Inquiry, { propertyId: string; message: string; preferredContact: string }>({
      query: (body) => ({ url: '/inquiries', method: 'POST', body }),
      invalidatesTags: ['Inquiry'],
    }),
    updateInquiry: builder.mutation<Inquiry, { id: string; status?: string; internalNotes?: string }>({
      query: ({ id, ...body }) => ({ url: `/inquiries/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Inquiry'],
    }),
    assignInquiry: builder.mutation<Inquiry, { id: string; assignedToId: string }>({
      query: ({ id, assignedToId }) => ({
        url: `/inquiries/${id}/assign`,
        method: 'PATCH',
        body: { assignedToId },
      }),
      invalidatesTags: ['Inquiry'],
    }),
    getInquiryMessages: builder.query<InquiryMessage[], string>({
      query: (id) => `/inquiries/${id}/messages`,
      providesTags: (_result, _err, id) => [{ type: 'InquiryMessage', id }],
    }),
    sendInquiryMessage: builder.mutation<InquiryMessage, { id: string; message: string }>({
      query: ({ id, message }) => ({ url: `/inquiries/${id}/messages`, method: 'POST', body: { message } }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'InquiryMessage', id }, 'Inquiry'],
    }),
  }),
});

export const {
  useGetInquiriesQuery,
  useGetMyInquiriesQuery,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
  useAssignInquiryMutation,
  useGetInquiryMessagesQuery,
  useSendInquiryMessageMutation,
} = inquiriesApi;
