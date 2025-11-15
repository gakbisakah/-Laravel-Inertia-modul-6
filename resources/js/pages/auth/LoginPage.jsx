import React, { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2Icon, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

export default function LoginPage() {
    // Ambil data dari controller Laravel
    const { success } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/auth/login/post");
    };

    return (
        <AuthLayout>
            <Card className="shadow-xl border-0">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl">Selamat Datang Kembali</CardTitle>
                    <CardDescription>
                        Senang bertemu dengan Anda lagi!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success && (
                        <div className="mb-4">
                            <Alert>
                                <CheckCircle2Icon />
                                <AlertTitle>Success!</AlertTitle>
                                <AlertDescription>
                                    {success}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
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
                                />
                                {errors.email && (
                                    <div className="text-sm text-red-600">
                                        {errors.email}
                                    </div>
                                )}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">
                                    Kata Sandi
                                </FieldLabel>
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
                                        : "Masuk"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Belum punya akun?{' '}
                                    <Link
                                        href="/auth/register"
                                        className="text-primary hover:underline"
                                    >
                                        Daftar di sini
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