import React from "react";
import { Link } from "@inertiajs/react";

export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
            <div className="container mx-auto px-4 py-8">
                <div className="w-full max-w-[420px] mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}