import { useEffect, useState } from 'react';
import { PlayCircle, Lock, Gift, Clock, CheckCircle, TrendingUp, Users, IndianRupee, BookOpen, Loader2 } from 'lucide-react';
import { supabase, COURSE_ID, COURSE_PRICE } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import VideoPlaceholder from '@/components/VideoPlaceholder';
import type { Video, Order } from '@/types';

export default function Dashboard() {
  const { navigate } = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [referralStats, setReferralStats] = useState({ total: 0, completed: 0, earned: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    async function loadDashboard() {
      const [{ data: videoData }, { data: orderData }] = await Promise.all([
        supabase.from('videos').select('*').eq('course_id', COURSE_ID).order('slot_number'),
        supabase.from('orders').select('*').eq('user_id', user!.id),
      ]);

      if (videoData) {
        setVideos(videoData.filter((v) => !v.is_intro));
        const intro = videoData.find((v) => v.is_intro);
        if (intro) setSelectedVideo(intro);
      }
      if (orderData) {
        setOrders(orderData);
        setHasPurchased(orderData.length > 0);
      }

      // Load referral stats
      const { data: refData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user!.id);

      if (refData) {
        const completed = refData.filter((r) => r.status === 'completed');
        setReferralStats({
          total: refData.length,
          completed: completed.length,
          earned: completed.reduce((sum, r) => sum + r.reward_amount, 0),
        });
      }

      setLoading(false);
    }
    loadDashboard();
  }, [user]);

  async function handlePurchase() {
    if (!user) return;
    setPurchasing(true);
    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        course_id: COURSE_ID,
        amount: COURSE_PRICE,
        status: 'completed',
      });
      if (error) throw error;
      setHasPurchased(true);
      setOrders((prev) => [...prev, {
        id: 'temp',
        user_id: user.id,
        course_id: COURSE_ID,
        amount: COURSE_PRICE,
        status: 'completed',
        created_at: new Date().toISOString(),
      }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Purchase failed.';
      alert(msg);
    } finally {
      setPurchasing(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    { icon: BookOpen, label: 'Course Progress', value: `${videos.filter((v) => v.is_published).length}/${videos.length}`, color: 'bg-blue-50 text-blue-700' },
    { icon: Users, label: 'Total Referrals', value: referralStats.total.toString(), color: 'bg-green-50 text-green-700' },
    { icon: CheckCircle, label: 'Successful Sales', value: referralStats.completed.toString(), color: 'bg-purple-50 text-purple-700' },
    { icon: IndianRupee, label: 'Total Earned', value: `₹${referralStats.earned}`, color: 'bg-orange-50 text-orange-700' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back, {profile?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">Continue your learning journey</p>
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

        {!hasPurchased && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Unlock Full Course Access</h3>
              <p className="text-gray-600 text-sm">Get lifetime access to all 10 video lessons for just ₹{COURSE_PRICE}</p>
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="px-6 py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center gap-2 shrink-0"
            >
              {purchasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Buy Now - ₹{COURSE_PRICE}
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player + List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Courses</h2>

            {/* Video Player */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
              {selectedVideo ? (
                <>
                  {selectedVideo.is_published && selectedVideo.video_url ? (
                    <video
                      src={selectedVideo.video_url}
                      controls
                      autoPlay
                      className="w-full aspect-video rounded-xl bg-black"
                    />
                  ) : (
                    <VideoPlaceholder
                      title={selectedVideo.title}
                      message={selectedVideo.is_intro ? 'Free Intro Video - Updating Soon' : 'Content Coming Soon'}
                      duration={selectedVideo.duration || undefined}
                    />
                  )}
                  <div className="mt-4 px-2">
                    <h3 className="font-semibold text-gray-900">{selectedVideo.title}</h3>
                    {selectedVideo.description && (
                      <p className="text-sm text-gray-600 mt-1">{selectedVideo.description}</p>
                    )}
                  </div>
                </>
              ) : (
                <VideoPlaceholder title="Select a Lesson" message="Choose a lesson from the list below" />
              )}
            </div>

            {/* Video List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Course Lessons</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {videos.map((video) => {
                  const isSelected = selectedVideo?.id === video.id;
                  const locked = !video.is_published && !hasPurchased;
                  return (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${
                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-700 text-white' : locked ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {locked ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700">Lesson {video.slot_number}</span>
                          {!video.is_published && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Coming Soon</span>
                          )}
                          {hasPurchased && !video.is_published && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">Content Updating</span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 truncate text-sm">{video.title}</h4>
                        {video.duration && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> {video.duration}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Referral Card */}
            <div className="bg-blue-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6" />
                <h3 className="font-bold text-lg">Refer & Earn</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">
                Earn ₹100 for every friend who buys the course through your referral link.
              </p>
              {profile?.referral_code && (
                <div className="bg-white/10 rounded-xl p-3 mb-4">
                  <p className="text-xs text-blue-200 mb-1">Your referral link:</p>
                  <p className="text-sm font-mono break-all">
                    {window.location.origin}/#/signup?ref={profile.referral_code}
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate('/refer')}
                className="w-full py-2.5 rounded-xl bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors text-sm"
              >
                View Details
              </button>
            </div>

            {/* Purchase History */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Purchase History</h3>
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Complete Digital Marketing</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{order.amount}</p>
                        <span className="text-xs text-green-600 flex items-center gap-1 justify-end">
                          <CheckCircle className="w-3 h-3" /> {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No purchases yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
