// Turns help-article text (simple Markdown) into safe HTML for dangerouslySetInnerHTML.
// Everything is HTML-escaped FIRST, so nothing typed into an article can add tags or scripts.
// Supports: # headings, **bold**, *italic*, `code`, ``` code blocks, - / * lists, 1. lists, > quotes.

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Same slug the table of contents uses, so its links jump to the heading
export const headingSlug = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-');

const inline = (s) => escapeHtml(s)
  .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">$1</code>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*(.+?)\*/g, '<em>$1</em>');

export function renderArticle(md) {
  const lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let para = [];
  let list = null; // { tag: 'ul' | 'ol', items: [] }
  let code = null; // lines inside ``` ... ```

  const flushPara = () => { if (para.length) { out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  const flush = () => { flushPara(); flushList(); };

  for (const line of lines) {
    if (code) {
      if (line.trim().startsWith('```')) { out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`); code = null; }
      else code.push(line);
      continue;
    }
    if (line.trim().startsWith('```')) { flush(); code = []; continue; }

    const h = line.match(/^(#{1,6})\s+(.+)$/);
    if (h) {
      flush();
      const level = h[1].length;
      out.push(`<h${level} id="${headingSlug(h[2])}" class="scroll-mt-20">${inline(h[2])}</h${level}>`);
      continue;
    }
    const ul = line.match(/^\s*[-*]\s+(.+)$/);
    const ol = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ul || ol) {
      flushPara();
      const tag = ul ? 'ul' : 'ol';
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push((ul || ol)[1]);
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { flush(); out.push(`<blockquote class="border-l-4 border-brand-500 pl-4 italic">${inline(q[1])}</blockquote>`); continue; }
    if (!line.trim()) { flush(); continue; }
    flushList();
    para.push(line);
  }
  if (code) out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
  flush();
  return out.join('\n');
}
