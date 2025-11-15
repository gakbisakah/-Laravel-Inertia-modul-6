import React, { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeContext"; // 🧩 pastikan ini sesuai path kamu

export default function AppLayout({ children }) {
    const { props, url } = usePage();
    const auth = props?.auth || {};
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { theme, toggleTheme } = useTheme(); // 🌙☀️ ambil dari context

    const onLogout = () => {
        router.get("/auth/logout");
    };

    return (
        <div className={`${theme} min-h-screen bg-background flex flex-col`}>
            {/* Navigation */}
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

                            <Link
                                href="/todos"
                                className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                📝 Todos
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
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-3 bg-white p-2 rounded-lg hover:bg-gray-50 transition-colors border"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium uppercase">
                                        {auth.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <div className="text-sm font-medium text-gray-700">
                                            {auth.name}
                                        </div>
                                    </div>
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {showProfileMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowProfileMenu(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-20">
                                            <div className="px-4 py-3 border-b">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {auth.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {auth.email}
                                                </div>
                                            </div>
                                            <div className="py-1">
                                                <div className="px-4 py-2 text-sm text-gray-600">
                                                    <div>Bergabung sejak:</div>
                                                    <div className="font-medium">
                                                        {new Date(
                                                            auth.created_at
                                                        ).toLocaleDateString("id-ID", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border-t">
                                                <button
                                                    onClick={onLogout}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    🚪 Keluar
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">{children}</main>

            <footer className="border-t bg-card py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Binjai Labs. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
