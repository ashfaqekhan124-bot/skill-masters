import { useEffect, useState } from 'react';
import { Users, IndianRupee, ShoppingBag, Video as VideoIcon, Upload, Save, X, Edit3, Loader2, CheckCircle, PlayCircle, Lock, Clock } from 'lucide-react';
import { supabase, COURSE_ID } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from '@/context/RouterContext';
import type { Video } from '@/types';

export default function Admin() {
  const { user, profile, loading: authLoading } = useAuth();
  const { navigate } = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', video_url: '', duration: '', is_published: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (profile?.role !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [authLoading, user, profile, navigate]);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;
    async function loadAdminData() {
      const [{ data: videoData }, { data: studentData }, { data: orderData }] = await Promise.all([
        supabase.from('videos').select('*').eq('course_id', COURSE_ID).order('slot_number'),
        supabase.from('profiles').select('id, role').eq('role', 'student'),
        supabase.from('orders').select('*'),
      ]);

      if (videoData) setVideos(videoData);
      if (studentData) setTotalStudents(studentData.length);
      if (orderData) {
        setTotalSales(orderData.length);
        setTotalRevenue(orderData.reduce((sum, o) => sum + o.amount, 0));
      }
      setLoading(false);
    }
    loadAdminData();
  }, [user, profile]);

  function openEditModal(video: Video) {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description,
      video_url: video.video_url || '',
      duration: video.duration || '',
      is_published: video.is_published,
    });
    setShowEditModal(true);
  }

  async function handleSaveVideo() {
    if (!editingVideo) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title: editForm.title,
          description: editForm.description,
          video_url: editForm.video_url || null,
          duration: editForm.duration || null,
          is_published: editForm.is_published,
        })
        .eq('id', editingVideo.id);

      if (error) throw error;

      // Update local state
      setVideos((prev) =>
        prev.map((v) =>
          v.id === editingVideo.id
            ? { ...v, ...editForm, video_url: editForm.video_url || null, duration: editForm.duration || null }
            : v
        )
      );
      setShowEditModal(false);
      setEditingVideo(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save.';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') return null;

  const stats = [
    { icon: Users, label: 'Total Students', value: totalStudents, color: 'bg-blue-50 text-blue-700' },
    { icon: ShoppingBag, label: 'Total Sales', value: totalSales, color: 'bg-green-50 text-green-700' },
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${totalRevenue}`, color: 'bg-orange-50 text-orange-700' },
    { icon: VideoIcon, label: 'Total Videos', value: videos.length, color: 'bg-purple-50 text-purple-700' },
  ];

  const courseVideos = videos.filter((v) => !v.is_intro);
  const introVideo = videos.find((v) => v.is_intro);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Panel</h1>
          <p className="text-gray-600">Manage students, videos, and view sales statistics</p>
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

        {/* Video Management */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-5 border-b border-gray-100 flex items-center gap-2">
            <VideoIcon className="w-5 h-5 text-blue-700" />
            <h2 className="font-bold text-gray-900">Upload & Manage Videos</h2>
          </div>

          {/* Intro Video */}
          {introVideo && (
            <div className="p-5 border-b border-gray-100 bg-blue-50/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold">FREE INTRO</span>
                  <h3 className="font-semibold text-gray-900">{introVideo.title}</h3>
                </div>
                <button
                  onClick={() => openEditModal(introVideo)}
                  className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Manage
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className={`flex items-center gap-1 ${introVideo.is_published ? 'text-green-600' : 'text-gray-500'}`}>
                  {introVideo.is_published ? <CheckCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {introVideo.is_published ? 'Published' : 'Not Published'}
                </span>
                {introVideo.video_url ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" /> Video Uploaded
                  </span>
                ) : (
                  <span className="text-gray-500 flex items-center gap-1">
                    <Upload className="w-4 h-4" /> No Video URL
                  </span>
                )}
                {introVideo.duration && (
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {introVideo.duration}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Course Videos */}
          <div className="divide-y divide-gray-100">
            {courseVideos.map((video) => (
              <div key={video.id} className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                  video.is_published ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {video.slot_number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{video.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span className={`flex items-center gap-1 ${video.is_published ? 'text-green-600' : ''}`}>
                      {video.is_published ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {video.is_published ? 'Published' : 'Coming Soon'}
                    </span>
                    {video.video_url && (
                      <span className="text-green-600 flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" /> Video Uploaded
                      </span>
                    )}
                    {video.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {video.duration}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openEditModal(video)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shrink-0"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">
                {editingVideo.is_intro ? 'Manage Intro Video' : `Edit Lesson ${editingVideo.slot_number}`}
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Video Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Video URL <span className="text-gray-400 font-normal">(MP4 or streaming link)</span>
                </label>
                <input
                  type="url"
                  value={editForm.video_url}
                  onChange={(e) => setEditForm({ ...editForm, video_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a direct video URL. Leave empty if video is not ready yet.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</label>
                <input
                  type="text"
                  value={editForm.duration}
                  onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  placeholder="e.g. 15 min"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={editForm.is_published}
                  onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                  className="w-5 h-5 rounded text-blue-700 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Publish Video</p>
                  <p className="text-xs text-gray-500">Make this video visible and playable to students</p>
                </div>
              </label>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVideo}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
