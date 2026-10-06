import { useEffect, useState } from 'react';
import { PlayCircle, Lock, CheckCircle, Clock, ArrowRight, Star } from 'lucide-react';
import { supabase, COURSE_ID } from '@/lib/supabase';
import { useRouter } from '@/context/RouterContext';
import { useAuth } from '@/context/AuthContext';
import VideoPlaceholder from '@/components/VideoPlaceholder';
import type { Course, Video } from '@/types';

export default function Courses() {
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

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Course Library</h1>
          <p className="text-gray-600 text-lg">Explore our comprehensive digital marketing course</p>
        </div>
      </div>

      {/* Course Overview */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl animate-pulse" />
              <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          ) : course ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Intro video */}
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

                {/* Course description */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About This Course</h2>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {/* Curriculum */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum ({course.total_videos} videos)</h2>
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                          {video.is_published ? (
                            <PlayCircle className="w-5 h-5 text-blue-700" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-700">Lesson {video.slot_number}</span>
                            {!video.is_published && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Coming Soon</span>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                          {video.duration && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {video.duration}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar - Pricing */}
              <div className="lg:col-span-1">
                <div className="sticky top-20 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-4xl font-bold text-blue-700">₹{course.price}</span>
                    <span className="text-lg text-gray-400 line-through">₹999</span>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-sm font-medium mb-4">
                    80% OFF
                  </span>

                  <div className="space-y-3 mb-6">
                    {[
                      '10 comprehensive video lessons',
                      'Free 5-minute intro video',
                      'Lifetime access on all devices',
                      'Certificate of completion',
                      'Refer & earn ₹100 per referral',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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

                  <div className="flex items-center gap-2 mt-4 justify-center">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">5,000+ students enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">Course not found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
