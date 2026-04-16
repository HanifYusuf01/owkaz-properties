import { baseApi } from '../../store/baseApi';
import { Property, PaginatedResponse } from '../../types';

interface PropertyFilters {
  search?: string;
  type?: string;
  status?: string;
  state?: string;
  lga?: string;
  priceMin?: number;
  priceMax?: number;
  beds?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<PaginatedResponse<Property>, PropertyFilters>({
      query: (params) => ({ url: '/properties', params }),
      providesTags: ['Property'],
    }),
    getAdminProperties: builder.query<PaginatedResponse<Property>, PropertyFilters>({
      query: (params) => ({ url: '/properties/admin/all', params }),
      providesTags: ['Property'],
    }),
    getSoldProperties: builder.query<PaginatedResponse<Property>, PropertyFilters>({
      query: (params) => ({ url: '/properties/admin/sold', params }),
      providesTags: ['Property'],
    }),
    getFeaturedProperties: builder.query<Property[], void>({
      query: () => '/properties/featured',
      providesTags: ['Property'],
    }),
    getPublicSoldProperties: builder.query<PaginatedResponse<Property>, PropertyFilters>({
      query: (params) => ({ url: '/properties/sold', params }),
      providesTags: ['Property'],
    }),
    getMyProperties: builder.query<PaginatedResponse<Property>, PropertyFilters>({
      query: (params) => ({ url: '/properties/my/listings', params }),
      providesTags: ['MyListings'],
    }),
    getPropertyById: builder.query<Property, string>({
      query: (id) => `/properties/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Property', id }],
    }),
    createProperty: builder.mutation<Property, Partial<Property>>({
      query: (body) => ({ url: '/properties', method: 'POST', body }),
      invalidatesTags: ['Property', 'MyListings'],
    }),
    updateProperty: builder.mutation<Property, { id: string; data: Partial<Property> }>({
      query: ({ id, data }) => ({ url: `/properties/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['Property', 'MyListings'],
    }),
    approveProperty: builder.mutation<Property, string>({
      query: (id) => ({ url: `/properties/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['Property'],
    }),
    rejectProperty: builder.mutation<Property, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/properties/${id}/reject`,
        method: 'PATCH',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Property'],
    }),
    markPropertySold: builder.mutation<Property, { id: string; salePrice?: number }>({
      query: ({ id, salePrice }) => ({
        url: `/properties/${id}/sold`,
        method: 'PATCH',
        body: { salePrice },
      }),
      invalidatesTags: ['Property', 'MyListings'],
    }),
    toggleFeatured: builder.mutation<Property, string>({
      query: (id) => ({ url: `/properties/${id}/feature`, method: 'PATCH' }),
      invalidatesTags: ['Property'],
    }),
    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({ url: `/properties/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Property', 'MyListings'],
    }),
    uploadImages: builder.mutation<{ urls: string[] }, FormData>({
      query: (formData) => ({ url: '/upload/images', method: 'POST', body: formData }),
    }),
    getSavedProperties: builder.query<Property[], void>({
      query: () => '/properties/saved',
      providesTags: ['SavedProperty'],
    }),
    getSavedPropertyIds: builder.query<string[], void>({
      query: () => '/properties/saved/ids',
      providesTags: ['SavedProperty'],
    }),
    saveProperty: builder.mutation<void, string>({
      query: (id) => ({ url: `/properties/${id}/save`, method: 'POST' }),
      invalidatesTags: ['SavedProperty'],
    }),
    unsaveProperty: builder.mutation<void, string>({
      query: (id) => ({ url: `/properties/${id}/save`, method: 'DELETE' }),
      invalidatesTags: ['SavedProperty'],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetAdminPropertiesQuery,
  useGetSoldPropertiesQuery,
  useGetFeaturedPropertiesQuery,
  useGetPublicSoldPropertiesQuery,
  useGetMyPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useApprovePropertyMutation,
  useRejectPropertyMutation,
  useMarkPropertySoldMutation,
  useToggleFeaturedMutation,
  useDeletePropertyMutation,
  useUploadImagesMutation,
  useGetSavedPropertiesQuery,
  useGetSavedPropertyIdsQuery,
  useSavePropertyMutation,
  useUnsavePropertyMutation,
} = propertiesApi;
