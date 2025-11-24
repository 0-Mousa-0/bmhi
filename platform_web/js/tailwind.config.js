/**
 * Tailwind CSS Configuration
 * Used by the CDN script to apply custom themes
 */
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['IBM Plex Sans Arabic', 'sans-serif'],
            },
            colors: {
                ksaGreen: {
                    DEFAULT: '#014B32', // اللون الأساسي
                    light: '#016C48',
                    dark: '#003826'
                },
                bgLight: '#F7F9FC',
            },
            boxShadow: {
                'plate': '0 4px 20px -2px rgba(0, 0, 0, 0.15)',
            }
        }
    }
}