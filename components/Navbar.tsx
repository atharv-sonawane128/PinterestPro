import React from 'react';
import { Search, Bell, MessageCircle, User, ChevronDown, Camera, Mic, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useSearch } from '@/context/SearchContext';
import { usePathname, useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  if (!mounted) return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white z-50 flex items-center px-4 md:px-8 border-b border-gray-100">
      <div className="flex items-center gap-2 mr-4">
        <Link href="/" className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer">
          <span className="text-white font-bold text-xl">P</span>
        </Link>
      </div>
      <div className="flex-1 max-w-7xl mx-auto flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2 group">
        <Search className="text-gray-500 w-5 h-5" />
        <div className="w-full h-6 bg-transparent" />
      </div>
      <div className="w-10 h-10 ml-4 bg-gray-200 rounded-full animate-pulse" />
    </nav>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white z-50 flex items-center px-4 md:px-8 border-b border-gray-100">
      <div className="flex items-center gap-2 mr-4">
        <Link href="/" className="flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <img src="/image.png" alt="Pinterest Pro" className="h-12 w-auto object-contain" />
        </Link>
      </div>

      <div className="flex-1 max-w-7xl mx-auto flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2 group focus-within:ring-2 focus-within:ring-blue-400 transition-all">
        <Search className="text-gray-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search for ideas..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-500 text-base"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-4">
        {user ? (
          <>
            <div className="flex items-center gap-1 cursor-pointer group relative">
              <Link href="/profile" className="flex items-center gap-1 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-gray-100 shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-semibold text-sm border border-purple-300 shadow-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                <ChevronDown className="text-gray-500 w-4 h-4" />
              </Link>

            </div>
          </>
        ) : (
          <button
            onClick={login}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded-full font-bold transition-all active:scale-95 shadow-sm"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
