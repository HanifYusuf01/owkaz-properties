import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useForgotPasswordMutation } from '../features/auth/authApi';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await forgotPassword(data).unwrap();
      setSubmitted(true);
    } catch {
      // error handled via RTK state
    }
  };

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
          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">Check your email</h2>
              <p className="text-muted text-sm mb-6">
                If an account exists for that email, we've sent a password reset link. It expires in 1 hour.
              </p>
              <Link to="/login" className="text-teal font-semibold text-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl text-navy mb-2">Forgot password?</h2>
              <p className="text-muted text-sm mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  Something went wrong. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Button type="submit" loading={isLoading} className="w-full mt-2">
                  Send reset link
                </Button>
              </form>

              <p className="text-center text-sm text-muted mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-teal font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
