import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApi';
import { useAppDispatch } from '../store';
import { setCredentials } from '../features/auth/authSlice';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UserRole, AuthTokens } from '../types';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
  role: z.string(),
  agency: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

const roleDescriptions: Record<string, string> = {
  buyer: 'Browse curated listings and submit inquiries.',
  agent: 'Submit properties for review and manage your portfolio.',
  owner: 'List your own properties for approval and sale.',
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BUYER);
  const [pendingApproval, setPendingApproval] = useState(false);

  const { register: formRegister, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: UserRole.BUYER },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue('role', role);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword: _, ...payload } = data;
      const result = await register(payload).unwrap();
      if ('pending' in result) {
        setPendingApproval(true);
      } else {
        dispatch(setCredentials(result as AuthTokens));
        navigate('/dashboard');
      }
    } catch {
      // handled via RTK state
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-navy flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 border border-gold/10 rounded-full" />
        <div className="relative z-10">
          <div className="font-display text-5xl text-white leading-tight">
            Join Owkaz <span className="text-gold">Properties</span>
          </div>
          <p className="mt-4 text-white/50 font-light text-base max-w-sm leading-relaxed">
            Create your account and start your real estate journey today.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-[480px] flex items-center justify-center px-8 py-12 bg-[#FEFBEA]">
        <div className="w-full max-w-sm">
          {pendingApproval ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="font-display text-2xl text-navy mb-2">Application Submitted</h2>
              <p className="text-muted text-sm mb-6 leading-relaxed">
                Your agent account is pending admin approval. You'll be able to sign in once your account is reviewed.
              </p>
              <Link to="/login" className="text-teal font-semibold text-sm hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
          <h2 className="font-display text-3xl text-navy mb-2">Create Account</h2>
          <p className="text-muted text-sm mb-8">Join Owkaz Properties today</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              Registration failed. Email may already be in use.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full Name" placeholder="Your full name" error={errors.name?.message} {...formRegister('name')} />
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...formRegister('email')} />
            <Input label="Password" type="password" showToggle placeholder="Minimum 8 characters" error={errors.password?.message} {...formRegister('password')} />
            <Input label="Confirm Password" type="password" showToggle placeholder="Re-enter your password" error={errors.confirmPassword?.message} {...formRegister('confirmPassword')} />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-navy block mb-2">I am a...</label>
              <div className="flex gap-2">
                {([UserRole.BUYER, UserRole.AGENT, UserRole.OWNER] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRoleSelect(role)}
                    className={`flex-1 py-2 px-3 rounded-full border text-xs font-semibold capitalize transition-all ${
                      selectedRole === role
                        ? 'bg-navy text-white border-navy'
                        : 'border-border text-muted hover:border-navy hover:text-navy'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">{roleDescriptions[selectedRole]}</p>
            </div>

            {(selectedRole === UserRole.AGENT) && (
              <Input label="Agency Name" placeholder="Your agency name" {...formRegister('agency')} />
            )}

            <Button type="submit" loading={isLoading} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
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
