import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, parseQuery } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';

type Step = 'signup' | 'otp';

export default function Signup() {
  const { navigate } = useRouter();
  const { refreshProfile } = useAuth();
  const queryParams = parseQuery(window.location.pathname + window.location.search);
  const refCode = queryParams.ref || '';

  const [step, setStep] = useState<Step>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function storeOTP(emailAddr: string): Promise<string> {
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    const { error: insertError } = await supabase
      .from('otp_codes')
      .insert({ email: emailAddr, code, expires_at: expiresAt });
    if (insertError) throw insertError;
    return code;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists by trying to store OTP (we'll check auth.users via signup)
      // Generate and store OTP
      const code = await storeOTP(email.trim().toLowerCase());

      // In a real app, we'd send this via email. Since Supabase email is off,
      // we display it in the UI for the user to verify (demo mode).
      // Also sign up the user in Supabase auth so the account exists.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          setError('This email is already registered. Please login instead.');
          setLoading(false);
          return;
        }
        throw signUpError;
      }

      // Move to OTP step
      setStep('otp');
      setInfo(`A 6-digit verification code has been sent to ${email}. For this demo, your code is: ${code}`);
      startResendCooldown();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function startResendCooldown() {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResendOTP() {
    setError('');
    setInfo('');

    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const code = await storeOTP(email.trim().toLowerCase());
      setInfo(`A new verification code has been sent. For this demo, your code is: ${code}`);
      startResendCooldown();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resend OTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      // Verify OTP from database
      const { data: otpData, error: otpError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (otpError) throw otpError;

      if (!otpData) {
        setError('No active verification code found. Please resend OTP.');
        setLoading(false);
        return;
      }

      // Check expiry
      if (new Date(otpData.expires_at) < new Date()) {
        setError('Your verification code has expired. Please resend OTP.');
        setLoading(false);
        return;
      }

      if (otpData.code !== otp) {
        setError('Incorrect verification code. Please try again.');
        setLoading(false);
        return;
      }

      // Mark as verified
      await supabase
        .from('otp_codes')
        .update({ verified: true })
        .eq('id', otpData.id);

      // Update profile email_verified
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ email_verified: true }).eq('id', user.id);

        // Handle referral if code was provided
        if (refCode) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('id')
            .eq('referral_code', refCode.toUpperCase())
            .maybeSingle();

          if (referrer) {
            await supabase.from('referrals').insert({
              referrer_id: referrer.id,
              referred_email: email.trim().toLowerCase(),
              status: 'pending',
              reward_amount: 100,
            });
          }
        }

        await refreshProfile();
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center mx-auto mb-4">
              {step === 'signup' ? (
                <User className="w-7 h-7 text-white" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {step === 'signup' ? 'Create Your Account' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-600 mt-2 text-sm">
              {step === 'signup'
                ? 'Join SkillMaster and start learning today'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <span className="flex-1">{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
              {info}
            </div>
          )}

          {/* Signup Form */}
          {step === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Form */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Email OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-900 text-center text-2xl tracking-[0.5em] font-semibold"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify & Continue <ShieldCheck className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
              </button>
            </form>
          )}

          {/* Footer */}
          {step === 'signup' && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-700 font-semibold hover:underline"
              >
                Login
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="mt-6 text-center text-sm text-gray-600">
              Wrong email?{' '}
              <button
                onClick={() => {
                  setStep('signup');
                  setOtp('');
                  setError('');
                  setInfo('');
                }}
                className="text-blue-700 font-semibold hover:underline"
              >
                Go back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
