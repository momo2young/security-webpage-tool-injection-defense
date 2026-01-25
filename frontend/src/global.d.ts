// allow prismjs imports without types
declare module 'prismjs';

interface Window {
    __TAURI__?: object;
    __SUZENT_BACKEND_PORT__?: number;
}
