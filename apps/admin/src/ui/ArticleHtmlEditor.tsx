import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

const JSON_LD = /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi;

/** Article body without JSON-LD blocks (those are preserved separately so visual editing never drops them). */
function split(html: string) {
  const scripts = html.match(JSON_LD) ?? [];
  return { visible: html.replace(JSON_LD, ''), scripts };
}

const clean = (html: string) =>
  DOMPurify.sanitize(html, { USE_PROFILES: { html: true, svg: true }, ADD_ATTR: ['target'], FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'] });

type Upload = { src: string; alt: string; width: number; height: number };

/** Blog article HTML editor: headings, lists, quotes, links, images, plus raw HTML mode. */
export function ArticleHtmlEditor({
  value,
  onChange,
  disabled,
  label,
  upload,
  rows = 18,
}: {
  value: string;
  onChange: (html: string) => void;
  disabled: boolean;
  label: string;
  upload?: (file: File) => Promise<Upload>;
  rows?: number;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState(false);
  const [error, setError] = useState('');
  const { visible, scripts } = split(value);

  useEffect(() => {
    if (source || !editor.current || document.activeElement === editor.current) return;
    const next = clean(visible);
    if (editor.current.innerHTML !== next) editor.current.innerHTML = next;
  }, [visible, source]);

  const emit = () => onChange((editor.current?.innerHTML ?? '') + scripts.join(''));

  function command(name: string, argument?: string) {
    editor.current?.focus();
    document.execCommand(name, false, argument);
    emit();
  }

  async function insertImage(file?: File) {
    if (!file || !upload) return;
    setError('');
    try {
      const asset = await upload(file);
      const alt = window.prompt('Describe the image (alt text)', '') ?? '';
      command('insertHTML', `<figure><img src="${asset.src}" alt="${alt.replace(/"/g, '&quot;')}" width="${asset.width}" height="${asset.height}" loading="lazy"></figure>`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Image upload failed');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  const blocks: [string, string, string][] = [
    ['<p>', 'P', 'Paragraph'],
    ['<h2>', 'H2', 'Heading 2'],
    ['<h3>', 'H3', 'Heading 3'],
    ['<h4>', 'H4', 'Heading 4'],
    ['<blockquote>', '❝', 'Quote'],
  ];
  const tools: [string, string, string][] = [
    ['bold', 'B', 'Bold'],
    ['italic', 'I', 'Italic'],
    ['underline', 'U', 'Underline'],
    ['insertUnorderedList', '• List', 'Bulleted list'],
    ['insertOrderedList', '1. List', 'Numbered list'],
    ['unlink', '↛', 'Remove link'],
    ['removeFormat', 'Tx', 'Clear formatting'],
  ];
  const off = disabled || source;

  return (
    <div className="cms-rich-editor cms-article-editor">
      <div className="cms-rich-toolbar" role="toolbar" aria-label={`${label} formatting`}>
        {blocks.map(([tag, text, title]) => (
          <button type="button" key={tag} title={title} aria-label={title} disabled={off} onMouseDown={(e) => e.preventDefault()} onClick={() => command('formatBlock', tag)}>
            {text}
          </button>
        ))}
        {tools.map(([name, text, title]) => (
          <button type="button" key={name} title={title} aria-label={title} disabled={off} onMouseDown={(e) => e.preventDefault()} onClick={() => command(name)}>
            {text}
          </button>
        ))}
        <button
          type="button"
          title="Insert link"
          aria-label="Insert link"
          disabled={off}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt('Enter a site path, HTTP(S) or mailto: link');
            if (url && /^(\/(?!\/)|#|https?:\/\/|mailto:)/.test(url)) command('createLink', url);
          }}
        >
          ↗ Link
        </button>
        {upload && (
          <>
            <button type="button" title="Insert image" aria-label="Insert image" disabled={off} onMouseDown={(e) => e.preventDefault()} onClick={() => fileInput.current?.click()}>
              🖼 Image
            </button>
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => void insertImage(e.target.files?.[0])} />
          </>
        )}
        <button type="button" disabled={disabled} aria-pressed={source} className="cms-html-toggle" onClick={() => setSource(!source)}>
          〈/〉 HTML
        </button>
      </div>
      {source ? (
        <textarea aria-label={`${label} HTML`} disabled={disabled} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div
          ref={editor}
          className="cms-rich-content"
          role="textbox"
          aria-label={label}
          aria-multiline="true"
          contentEditable={!disabled}
          suppressContentEditableWarning
          style={{ minHeight: `${rows * 1.2}rem`, maxHeight: '70vh', overflow: 'auto' }}
          onInput={emit}
          onPaste={(event) => {
            event.preventDefault();
            const html = event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>');
            document.execCommand('insertHTML', false, clean(html));
            emit();
          }}
        />
      )}
      {scripts.length > 0 && !source && (
        <p className="cms-field-hint">{scripts.length} structured-data (JSON-LD) block{scripts.length > 1 ? 's are' : ' is'} preserved with this article. Use 〈/〉 HTML to edit {scripts.length > 1 ? 'them' : 'it'}.</p>
      )}
      {error && <p className="cms-error" role="alert">{error}</p>}
    </div>
  );
}
