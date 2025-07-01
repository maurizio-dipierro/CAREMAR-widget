export function convertMarkdownToHtml(markdown) {
    function escapeHtml(text) {
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
    }
    markdown = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const languageClass = lang ? ` class="language-${lang}"` : '';
        return `<pre><code${languageClass}>${escapeHtml(code)}</code></pre>`;
    });
    markdown = markdown.replace(/`([^`]+)`/g, '<code>$1</code>');
    markdown = markdown.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    markdown = markdown.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    markdown = markdown.replace(/^\s*([-*+])\s+(.*)/gm, (match, bullet, item) => `<li>${item.trim()}</li>`);
    markdown = markdown.replace(/<\/li>\s*<li>/g, '</li><li>');
    markdown = markdown.replace(/(<li>(?:.|\n)*?<\/li>)/g, '<ul>$1</ul>');
    markdown = markdown.replace(/<\/ul>\s*<ul>/g, '');

    markdown = markdown.split(/\n\s*\n/).map(p => {
        if (p.startsWith('<pre>') || p.startsWith('<ul>') || p.startsWith('<li>') || p.startsWith('<strong>') || p.startsWith('<em>') || p.startsWith('<p>')) return p;
        return p ? `<p>${p}</p>` : '';
    }).join('');
    markdown = markdown.replace(/<p>(.*?)<\/p>/g, (match, content) => {
        return `<p>${content.replace(/(?<!<br>)\n/g, '<br>')}</p>`;
    });
    return markdown;
}
