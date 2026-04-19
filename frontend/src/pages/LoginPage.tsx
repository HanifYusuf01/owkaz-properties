import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../store';
import { setCredentials, setUser } from '../features/auth/authSlice';
import { UserRole } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ accessToken: result.accessToken, refreshToken: result.refreshToken }));
      dispatch(setUser(result.user));
      navigate(result.user.role === UserRole.BUYER ? '/' : '/dashboard');
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
            Nigeria's premier controlled residential real estate marketplace. Every listing curated.
          </p>
          <div className="mt-12 flex gap-10 pt-10 border-t border-white/10">
            <div>
              <div className="font-display text-3xl text-white">400+</div>
              <div className="text-[10px] uppercase tracking-widest text-teal-light mt-1">Listings</div>
            </div>
            <div>
              <div className="font-display text-3xl text-white">100%</div>
              <div className="text-[10px] uppercase tracking-widest text-teal-light mt-1">Verified</div>
            </div>
            <div>
              <div className="font-display text-3xl text-white">2,400+</div>
              <div className="text-[10px] uppercase tracking-widest text-teal-light mt-1">Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-[480px] flex items-center justify-center px-8 py-12 bg-[#FEFBEA]">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl text-navy mb-2">Welcome back</h2>
          <p className="text-muted text-sm mb-8">Sign in to your Owkaz account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {('data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data)
                ? String((error.data as Record<string, unknown>).message)
                : 'Invalid credentials. Please try again.'}
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
            <div>
              <Input
                label="Password"
                type="password"
                showToggle
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-1.5 text-right">
                <Link to="/forgot-password" className="text-xs text-teal hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
