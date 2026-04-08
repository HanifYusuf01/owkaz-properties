import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../features/auth/authApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);

  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      // error handled via RTK state
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand */}
      <div className="hidden lg:flex flex-1 bg-navy flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 border border-gold/10 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 border border-teal/20 rounded-full" />
        <div className="relative z-10">
          <div className="font-display text-5xl text-white leading-tight">
            Owkaz <span className="text-gold">Properties</span>
          </div>
          <p className="mt-4 text-white/50 font-light text-base max-w-sm leading-relaxed">
            Nigeria's premier controlled residential real estate marketplace.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center px-8 py-12 bg-[#FEFBEA]">
        <div className="w-full max-w-sm">
          {success ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">Password updated</h2>
              <p className="text-muted text-sm mb-6">
                Your password has been reset. Redirecting you to sign in…
              </p>
              <Link to="/login" className="text-teal font-semibold text-sm hover:underline">
                Sign in now
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl text-navy mb-2">Set new password</h2>
              <p className="text-muted text-sm mb-8">
                Choose a strong password for your Owkaz account.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  This reset link is invalid or has expired.{' '}
                  <Link to="/forgot-password" className="font-semibold underline">
                    Request a new one.
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
                <Button type="submit" loading={isLoading} className="w-full mt-2">
                  Reset password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
