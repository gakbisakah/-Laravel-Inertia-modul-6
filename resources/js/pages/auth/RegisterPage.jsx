import React, { useState } from "react";
import AuthLayout from "@/layouts/AuthLayout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useForm } from "@inertiajs/react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/auth/register/post", {
            onSuccess: () => {
                // Redirect ke halaman login setelah pendaftaran berhasil
                reset("name", "email", "password");
            },
            onError: () => {
                // Reset field password jika ada error
                reset("password");
            },
        });
    };

    return (
        <AuthLayout>
            <Card className="shadow-xl border-0">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
                    <CardDescription>
                        Mulai perjalanan produktif Anda bersama kami
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">
                                    Nama Lengkap
                                </FieldLabel>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Masukkan nama lengkap"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    required
                                />
                                {errors.name && (
                                    <div className="text-sm text-red-600">
                                        {errors.name}
                                    </div>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">
                                    Email
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="contoh@email.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    required
                                />
                                {errors.email && (
                                    <div className="text-sm text-red-600">
                                        {errors.email}
                                    </div>
                                )}
                            </Field>
                            <Field>
                                <div>
                                    <FieldLabel htmlFor="password">
                                        Kata Sandi
                                    </FieldLabel>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan kata sandi"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                "password",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <div className="text-sm text-red-600">
                                        {errors.password}
                                    </div>
                                )}
                            </Field>
                            <Field>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing
                                        ? "Memproses..."
                                        : "Daftar"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Sudah punya akun?{" "}
                                    <Link
                                        href="/auth/login"
                                        className="text-primary hover:underline"
                                    >
                                        Masuk di sini
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}