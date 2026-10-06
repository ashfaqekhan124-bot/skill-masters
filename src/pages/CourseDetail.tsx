import { useEffect, useState } from 'react';
import { CheckCircle, PlayCircle, ArrowRight, Clock, Star, Lock, Gift, IndianRupee } from 'lucide-react';
import { supabase, COURSE_ID } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import VideoPlaceholder from '@/components/VideoPlaceholder';
import type { Course, Video } from '@/types';

export default function CourseDetail() {
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

  const learningPoints = [
    'Master SEO fundamentals and rank on Google',
    'Create high-converting social media campaigns',
    'Run profitable Google and Facebook Ads',
    'Write compelling marketing copy that sells',
    'Build automated email marketing funnels',
    'Analyze data to make data-driven decisions',
    'Start your own affiliate marketing business',
    'Launch and scale a marketing agency',
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ) : course ? (
            <>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{course.title}</h1>
              <p className="text-gray-600 text-lg mb-4 max-w-3xl">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(4.9/5)</span>
                </div>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" /> {course.total_videos} lessons
                </span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Self-paced
                </span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Course not found.</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Free Intro Video */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Free Introduction Video</h2>
              {introVideo?.is_published && introVideo?.video_url ? (
                <video
                  src={introVideo.video_url}
                  controls
                  className="w-full aspect-video rounded-2xl bg-black"
                />
              ) : (
                <VideoPlaceholder
                  title="Free 5-Minute Introduction"
                  message="Free Intro Video - Updating Soon"
                  duration="5 min"
                />
              )}
            </div>

            {/* What you'll learn */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {learningPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      {video.is_published ? (
                        <PlayCircle className="w-5 h-5 text-blue-700" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold text-blue-700">Lesson {video.slot_number}</span>
                      <h3 className="font-medium text-gray-900">{video.title}</h3>
                      {!video.is_published && (
                        <span className="text-xs text-gray-500">Coming Soon</span>
                      )}
                    </div>
                    {video.duration && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {video.duration}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-bold text-blue-700">
                  ₹{course?.price || 199}
                </span>
                <span className="text-lg text-gray-400 line-through">₹999</span>
              </div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-sm font-medium mb-4">
                80% OFF
              </span>

              <div className="space-y-3 mb-6">
                {['10 video lessons', 'Free intro video', 'Lifetime access', 'Certificate included', 'Refer & earn ₹100'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="w-full py-3 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
              >
                {user ? 'Go to Dashboard' : 'Enroll Now'} <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 p-3 rounded-xl bg-blue-50 flex items-center gap-2">
                <Gift className="w-4 h-4 text-blue-700 shrink-0" />
                <p className="text-xs text-blue-700">
                  Refer a friend and earn <span className="font-bold">₹100</span> when they buy!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
