import { baseApi } from '../../store/baseApi';

export type SiteContent = Record<string, string>;

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContent: builder.query<SiteContent, string>({
      query: (page) => `/content/${page}`,
      providesTags: (_result, _error, page) => [{ type: 'Content', id: page }],
    }),
    updateContent: builder.mutation<SiteContent, { page: string; content: SiteContent }>({
      query: ({ page, content }) => ({ url: `/content/${page}`, method: 'PATCH', body: { content } }),
      invalidatesTags: (_result, _error, { page }) => [{ type: 'Content', id: page }],
    }),
  }),
});

export const { useGetContentQuery, useUpdateContentMutation } = contentApi;
