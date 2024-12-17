/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        // Habilita soporte para construcción aunque haya errores de TS
        ignoreBuildErrors: true,
    },
    eslint: {
        // Habilita soporte para construcción aunque haya errores de ESLint
        ignoreDuringBuilds: true,
    }
};

module.exports = nextConfig;