import "../css/app.css";
import "./bootstrap";
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./lib/ThemeContext";
import MainLayout from "./layouts/MainLayout";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
        let page = pages[`./pages/${name}.jsx`];

        // 🔥 Hanya gunakan MainLayout untuk halaman selain app/TodosPage
        if (name === "app/TodosPage") {
            page.default.layout = (page) => page; // tanpa layout
        } else {
            page.default.layout = page.default.layout || ((page) => <MainLayout>{page}</MainLayout>);
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );
    },
});
