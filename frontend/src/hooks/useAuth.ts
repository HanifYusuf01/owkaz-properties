import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setUser } from '../features/auth/authSlice';
import { useGetMeQuery } from '../features/auth/authApi';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAppSelector((s) => s.auth);

  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !accessToken || !!user,
  });

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  return { user, isLoading: isLoading && !!accessToken && !user };
};
