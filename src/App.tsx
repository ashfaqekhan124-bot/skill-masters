import { AuthProvider } from '@/context/AuthContext';
import { RouterProvider, useRouter, getPathOnly } from '@/context/RouterContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Courses from '@/pages/Courses';
import CourseDetail from '@/pages/CourseDetail';
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ReferEarn from '@/pages/ReferEarn';
import Admin from '@/pages/Admin';

function AppRoutes() {
  const { path } = useRouter();
  const currentPath = getPathOnly(path);

  const renderPage = () => {
    if (currentPath === '/') return <Home />;
    if (currentPath === '/courses') return <Courses />;
    if (currentPath === '/course-detail') return <CourseDetail />;
    if (currentPath === '/signup') return <Signup />;
    if (currentPath === '/login') return <Login />;
    if (currentPath === '/dashboard') return <Dashboard />;
    if (currentPath === '/refer') return <ReferEarn />;
    if (currentPath === '/admin') return <Admin />;
    return <Home />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
