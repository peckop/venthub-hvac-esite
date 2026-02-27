export const LOGOS = {
    // SVG or PNG Base64 representations. For small code, we will use a fetch-to-base64 utility
    // rather than hardcoding huge strings, or we'll provide a tiny clear placeholder.

    // A helper function to fetch an image URL and convert it to Base64
    async getBase64FromUrl(url: string): Promise<string> {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Error fetching image for PDF:', e);
            return '';
        }
    },

    // Example placeholder for VentHub if no logo URL provided
    VENTHUB_BASE64: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNDAiPjx0ZXh0IHk9IjMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMWEzNjVkIj5WZW50SHViPC90ZXh0Pjwvc3ZnPg=='
};
