import { useEffect, useState } from 'react';
import { Gift, Copy, Check, Users, CheckCircle, IndianRupee, TrendingUp, Share2, Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import { supabase } from '@/lib/supabase';
import type { Referral } from '@/types';

export default function ReferEarn() {
  const { user, profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    async function loadReferrals() {
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user!.id)
        .order('created_at', { ascending: false });
      if (data) setReferrals(data);
      setLoading(false);
    }
    loadReferrals();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/#/signup?ref=${profile.referral_code}`
    : '';

  const completedReferrals = referrals.filter((r) => r.status === 'completed');
  const totalEarned = completedReferrals.reduce((sum, r) => sum + r.reward_amount, 0);

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    const text = `Check out this amazing Digital Marketing course for just ₹199! Use my referral link to sign up: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  const stats = [
    { icon: Users, label: 'Total Referrals', value: referrals.length, color: 'bg-blue-50 text-blue-700' },
    { icon: CheckCircle, label: 'Successful Sales', value: completedReferrals.length, color: 'bg-green-50 text-green-700' },
    { icon: IndianRupee, label: 'Total Earned', value: `₹${totalEarned}`, color: 'bg-orange-50 text-orange-700' },
    { icon: TrendingUp, label: 'Pending Rewards', value: referrals.length - completedReferrals.length, color: 'bg-gray-100 text-gray-700' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Gift className="w-4 h-4" /> Referral Program
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Refer & Earn ₹100</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your unique referral link with friends. When they buy the course, you earn ₹100 for each successful sale.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { step: 1, icon: Share2, title: 'Share Your Link', desc: 'Send your unique referral link to friends via WhatsApp, email, or social media.' },
            { step: 2, icon: Users, title: 'Friends Sign Up', desc: 'Your friends create an account using your referral link and explore the course.' },
            { step: 3, icon: Award, title: 'You Earn ₹100', desc: 'When your friend buys the course, you get ₹100 credited to your earnings.' },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 mt-2">
                <item.icon className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Referral Link Card */}
        <div className="bg-blue-700 rounded-2xl p-6 lg:p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                <p className="text-white text-sm font-mono break-all">{referralLink || 'Loading...'}</p>
              </div>
              <button
                onClick={copyLink}
                className="px-6 py-3 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={shareWhatsApp}
              className="mt-3 px-6 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Referral History</h2>
          </div>
          {referrals.length > 0 ? (
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div>Email</div>
                <div>Status</div>
                <div>Reward</div>
                <div>Date</div>
              </div>
              {referrals.map((ref) => (
                <div key={ref.id} className="grid grid-cols-4 gap-4 px-5 py-3 items-center">
                  <div className="text-sm text-gray-900 truncate">{ref.referred_email}</div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      ref.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {ref.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {ref.status === 'completed' ? `₹${ref.reward_amount}` : '—'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(ref.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No referrals yet. Share your link to start earning!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
