import { baseApi } from '../../store/baseApi';
import { User } from '../../types';

export interface PropertyNote {
  id: string;
  propertyId: string;
  user: User;
  content: string;
  createdAt: string;
}

export const propertyNotesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPropertyNotes: builder.query<PropertyNote[], string>({
      query: (propertyId) => `/properties/${propertyId}/notes`,
      providesTags: (_r, _e, id) => [{ type: 'PropertyNote', id }],
    }),
    addPropertyNote: builder.mutation<PropertyNote, { propertyId: string; content: string }>({
      query: ({ propertyId, content }) => ({
        url: `/properties/${propertyId}/notes`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_r, _e, { propertyId }) => [{ type: 'PropertyNote', id: propertyId }],
    }),
  }),
});

export const { useGetPropertyNotesQuery, useAddPropertyNoteMutation } = propertyNotesApi;
