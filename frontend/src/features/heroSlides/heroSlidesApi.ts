import { baseApi } from '../../store/baseApi';

export interface HeroSlide {
  id: string;
  imageUrl: string;
  order: number;
  createdAt: string;
}

export const heroSlidesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHeroSlides: builder.query<HeroSlide[], void>({
      query: () => '/hero-slides',
      providesTags: ['HeroSlide'],
    }),
    createHeroSlide: builder.mutation<HeroSlide, Partial<HeroSlide>>({
      query: (body) => ({ url: '/hero-slides', method: 'POST', body }),
      invalidatesTags: ['HeroSlide'],
    }),
    updateHeroSlide: builder.mutation<HeroSlide, { id: string; data: Partial<HeroSlide> }>({
      query: ({ id, data }) => ({ url: `/hero-slides/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: ['HeroSlide'],
    }),
    deleteHeroSlide: builder.mutation<void, string>({
      query: (id) => ({ url: `/hero-slides/${id}`, method: 'DELETE' }),
      invalidatesTags: ['HeroSlide'],
    }),
  }),
});

export const {
  useGetHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
} = heroSlidesApi;
