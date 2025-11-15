import React, { useState } from "react";
import { useTheme } from "@/lib/ThemeContext";
import { Link, router, usePage } from "@inertiajs/react";

export default function MainLayout({ children }) {
    const { theme, toggleTheme } = useTheme();
    const { url, props } = usePage(); // dapatkan URL halaman aktif
    const auth = props?.auth || {};
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // daftar halaman tanpa header
    const hideHeaderRoutes = ["/login", "/register", "/"];
    const shouldHideHeader = hideHeaderRoutes.includes(url);

    const onLogout = () => {
        router.get("/auth/logout");
    };

    return (
        <div className={theme}>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
                
                {/* Header tampil hanya jika halaman bukan login/register */}
                {!shouldHideHeader && (
                   <nav className="border-b bg-card shadow-sm">
                                   <div className="container mx-auto px-4">
                                       <div className="flex h-16 items-center justify-between">
                                           <div className="flex items-center space-x-6">
                                               <Link href="/" className="flex items-center space-x-2">
                                                   <span className="inline-block p-2 bg-blue-600 text-white rounded-lg font-bold text-lg">
                                                       B
                                                   </span>
                                                   <span className="text-xl font-bold text-blue-600">
                                                       BinjaiAplikasi
                                                   </span>
                                               </Link>
                   
                                               
                                           </div>
                   
                                           <div className="flex items-center space-x-5">
                                               {/* 🌙☀️ Tombol Mode Malam (diganti sesuai permintaan) */}
                                               <button
                                                   onClick={toggleTheme}
                                                   title="Ganti mode"
                                                   className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                                               >
                                                   {theme === "light" ? "🌙" : "☀️"}
                                               </button>
                   
                                               {/* User Profile Dropdown */}
                                             
                                           </div>
                                       </div>
                                   </div>
                               </nav>
                )}

                {/* Main content */}
                <main className="flex-grow">{children}</main>

               
            </div>
        </div>
    );
}
