export async function loadConfig() {
    let apiUrl = '';
    let apikey = '';

    try {
        const res = await fetch('/widget-config');
        const cfg = await res.json();
        apikey = cfg.rag_app_api_key || '';
        apiUrl = cfg.rag_api_url || '';

    } catch (err) {
        console.error('Could not load widget config:', err);
    }

    return { apiUrl,apikey};
}
