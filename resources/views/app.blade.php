<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title inertia>{{ config('app.name', 'Laravel Inertia') }}</title>

    <!-- Scripts -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead

    <!-- SweetAlert2 and ApexCharts via CDN -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts" defer></script>
</head>

<body class="font-sans antialiased">
    @inertia

    {{-- flash messages as meta tags to avoid Blade inside inline JS --}}
    @if(session('success'))
        <meta name="flash-success" content="{{ e(session('success')) }}">
    @endif
    @if(session('error'))
        <meta name="flash-error" content="{{ e(session('error')) }}">
    @endif

    <script>
        // show session flash using SweetAlert2 (if loaded)
        document.addEventListener('DOMContentLoaded', function() {
            const successMeta = document.querySelector('meta[name="flash-success"]');
            const errorMeta = document.querySelector('meta[name="flash-error"]');
            const success = successMeta ? successMeta.getAttribute('content') : null;
            const error = errorMeta ? errorMeta.getAttribute('content') : null;

            if (window.Swal) {
                if (success) {
                    Swal.fire({ icon: 'success', title: 'Berhasil', text: success });
                }
                if (error) {
                    Swal.fire({ icon: 'error', title: 'Gagal', text: error });
                }
            }
        });
    </script>
</body>

</html>
