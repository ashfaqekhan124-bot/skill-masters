import { useEffect, useState } from 'react';
import { PlayCircle, CheckCircle, Users, Award, TrendingUp, ArrowRight, Star, Gift, Lock } from 'lucide-react';
import { supabase, COURSE_ID } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import VideoPlaceholder from '@/components/VideoPlaceholder';
import type { Course, Video } from '@/types';

export default function Home() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [introVideo, setIntroVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ data: courseData }, { data: videoData }] = await Promise.all([
        supabase.from('courses').select('*').eq('id', COURSE_ID).maybeSingle(),
        supabase.from('videos').select('*').eq('course_id', COURSE_ID).order('slot_number'),
      ]);

      if (courseData) setCourse(courseData);
      if (videoData) {
        setVideos(videoData.filter((v) => !v.is_intro));
        setIntroVideo(videoData.find((v) => v.is_intro) || null);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const benefits = [
    { icon: PlayCircle, title: '10 Expert Video Lessons', desc: 'Comprehensive modules covering every aspect of digital marketing' },
    { icon: Award, title: 'Industry Certificate', desc: 'Get a recognized certificate upon course completion' },
    { icon: Users, title: 'Expert Community', desc: 'Join thousands of learners and marketing professionals' },
    { icon: TrendingUp, title: 'Career Growth', desc: 'Boost your career with in-demand digital marketing skills' },
  ];

  const testimonials = [
    { name: 'Priya Sharma', role: 'Marketing Executive', text: 'This course transformed my understanding of digital marketing. The lessons are clear and practical!', rating: 5 },
    { name: 'Rahul Verma', role: 'Freelance Marketer', text: 'Best ₹199 I ever spent. The referral program helped me earn back the course fee and more.', rating: 5 },
    { name: 'Anjali Gupta', role: 'Small Business Owner', text: 'I learned how to market my own business online. The ROI has been incredible.', rating: 5 },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-blue-700" />
                #1 Digital Marketing Course
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Master Digital Marketing <span className="text-blue-700">in 10 Lessons</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Learn SEO, social media, paid ads, content marketing, and more. Get expert-led video lessons, lifetime access, and a certificate — all for just ₹199.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/signup')}
                  className="px-8 py-3.5 rounded-xl bg-blue-700 text-white font-semibold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  {user ? 'Go to Dashboard' : 'Enroll Now - ₹199'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="px-8 py-3.5 rounded-xl border-2 border-gray-200 text-gray-800 font-semibold text-lg hover:border-blue-700 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" />
                  View Course
                </button>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-3">
                  {['P', 'R', 'A', 'S', 'M'].map((c, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-semibold"
                      style={{ backgroundColor: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][i] }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Joined by 5,000+ students</p>
                </div>
              </div>
            </div>

            {/* Intro Video Section */}
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-200/30 rounded-3xl blur-2xl" />
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">Free Intro Video</span>
                  </div>
                  {loading ? (
                    <div className="w-full aspect-video bg-gray-100 rounded-xl animate-pulse" />
                  ) : introVideo?.is_published && introVideo?.video_url ? (
                    <video
                      src={introVideo.video_url}
                      controls
                      className="w-full aspect-video rounded-xl bg-black"
                    />
                  ) : (
                    <VideoPlaceholder
                      title="Free 5-Minute Introduction"
                      message="Free Intro Video - Updating Soon"
                      duration="5 min"
                    />
                  )}
                </div>
                <div className="absolute -top-3 -right-3 bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold">
                  FREE Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkillMaster?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everything you need to launch your digital marketing career
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-700 transition-colors">
                  <benefit.icon className="w-6 h-6 text-blue-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Overview Section */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Course Curriculum
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                {course?.description || '10 comprehensive video lessons covering everything from SEO to building your own marketing agency.'}
              </p>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-4xl font-bold text-blue-700">₹199</span>
                  <span className="text-lg text-gray-400 line-through">₹999</span>
                  <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-sm font-medium">
                    80% OFF
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {['10 Video Lessons', 'Free Intro Video', 'Lifetime Access', 'Certificate of Completion', 'Refer & Earn ₹100 per referral'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/signup')}
                  className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            </div>

            {/* Video slot cards */}
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="aspect-video bg-gray-200 rounded-xl animate-pulse" />
                ))
              ) : (
                videos.map((video) => (
                  <div
                    key={video.id}
                    className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 group cursor-pointer"
                    onClick={() => navigate('/courses')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                      <PlayCircle className="w-8 h-8 text-blue-500 opacity-60" />
                      <span className="text-white text-xs font-medium text-center line-clamp-2">
                        {video.title}
                      </span>
                      {!video.is_published && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Coming Soon
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center">
                      {video.slot_number}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Refer & Earn Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-blue-700 p-8 lg:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                  <Gift className="w-4 h-4" /> Referral Program
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Refer & Earn ₹100 per Sale
                </h2>
                <p className="text-blue-100 text-lg max-w-xl">
                  Share your unique referral link. When someone buys the course through your link, you earn ₹100 instantly.
                </p>
              </div>
              <button
                onClick={() => navigate('/refer')}
                className="px-8 py-3.5 rounded-xl bg-white text-blue-700 font-semibold text-lg hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-2 shrink-0"
              >
                Learn More <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Join 5,000+ students who have transformed their careers with SkillMaster
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/signup')}
            className="px-10 py-4 rounded-xl bg-blue-700 text-white font-semibold text-lg hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            Enroll Now for ₹199 <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
