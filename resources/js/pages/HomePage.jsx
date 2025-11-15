import React from "react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
    const technologies = [
        {
            name: "Laravel",
            icon: "&#127968;",
            description:
                "PHP framework untuk backend yang elegant dan powerful",
            docLink: "https://laravel.com/docs",
        },
        {
            name: "Inertia.js",
            icon: "&#128737;",
            description:
                "Bridge antara Laravel dan React tanpa API boilerplate",
            docLink: "https://inertiajs.com",
        },
        {
            name: "ViteJS",
            icon: "⚡",
            description:
                "Build tool modern yang sangat cepat untuk development",
            docLink: "https://vitejs.dev",
        },
        {
            name: "React.js",
            icon: "⚛️",
            description: "Library JavaScript untuk building user interfaces",
            docLink: "https://reactjs.org",
        },
        {
            name: "Shadcn/ui",
            icon: "🎨",
            description: "Component library yang reusable dan customizable",
            docLink: "https://ui.shadcn.com",
        },
    ];

    return (
        <AppLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16 relative">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-70"></div>
                        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent relative">
                            <span className="inline-block transform hover:scale-110 transition-transform duration-200"
                                dangerouslySetInnerHTML={{
                                    __html: "&#128075;",
                                }}
                            />
                            Hai! Selamat Datang
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Kelola tugas dan rencana Anda dengan mudah menggunakan teknologi modern:
                            <span className="font-semibold text-blue-600"> Laravel</span>,
                            <span className="font-semibold text-blue-600"> Inertia</span>,
                            <span className="font-semibold text-blue-600"> React</span>, dan
                            <span className="font-semibold text-blue-600"> Shadcn/ui</span>
                        </p>
                    </div>

                    {/* Technologies Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {technologies.map((tech, index) => (
                            <Card key={index} className="flex flex-col">
                                <CardHeader className="text-center">
                                    <CardTitle className="flex items-center justify-center gap-2">
                                        <span
                                            className="text-2xl"
                                            dangerouslySetInnerHTML={{
                                                __html: tech.icon,
                                            }}
                                        />
                                        {tech.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grow">
                                    <p className="text-sm text-muted-foreground text-center">
                                        {tech.description}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        asChild
                                    >
                                        <a
                                            href={tech.docLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html: "&#128214;",
                                                }}
                                            />
                                            Dokumentasi
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Quick Start */}
                    <Card className="mb-8">
                        <CardHeader className="text-center">
                            <CardTitle>
                                <span
                                    dangerouslySetInnerHTML={{
                                        __html: "&#128640;",
                                    }}
                                />
                                Quick Start
                            </CardTitle>
                            <CardDescription>
                                Mulai development dengan stack modern ini
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <span
                                        className="text-lg"
                                        dangerouslySetInnerHTML={{
                                            __html: "&#128295;",
                                        }}
                                    />
                                    <div>
                                        <h4 className="font-semibold">
                                            Backend Development
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Gunakan Laravel untuk membuat API
                                            dan backend logic
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span
                                        className="text-lg"
                                        dangerouslySetInnerHTML={{
                                            __html: "&#128187;",
                                        }}
                                    />
                                    <div>
                                        <h4 className="font-semibold">
                                            Frontend Development
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Build UI dengan React dan component
                                            dari shadcn/ui
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span
                                        className="text-lg"
                                        dangerouslySetInnerHTML={{
                                            __html: "&#128288;",
                                        }}
                                    />
                                    <div>
                                        <h4 className="font-semibold">
                                            Integration
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Inertia.js menghubungkan Laravel dan
                                            React secara seamless
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center text-muted-foreground">
                        <p>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "&#127881;",
                                }}
                            />
                            Happy coding!
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: "&#127881;",
                                }}
                            />
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}