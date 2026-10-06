import { ReactNode } from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">SkillMaster</h3>
            <p className="text-sm text-gray-400">
              Master digital marketing with our comprehensive course. Learn at your own pace with expert-led video lessons.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#/" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#/courses" className="hover:text-white transition-colors">Courses</a></li>
              <li><a href="#/refer" className="hover:text-white transition-colors">Refer & Earn</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Course</h4>
            <ul className="space-y-2 text-sm">
              <li>10 Video Lessons</li>
              <li>Free Intro Video</li>
              <li>Certificate Included</li>
              <li>Lifetime Access</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>support@skillmaster.com</li>
              <li>+91 98765 43210</li>
              <li>Mon-Sat, 9am-6pm IST</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SkillMaster. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
