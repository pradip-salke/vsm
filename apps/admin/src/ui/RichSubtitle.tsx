import { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';

const clean = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'a'], ALLOWED_ATTR: ['href', 'title', 'style'], FORBID_ATTR: ['id', 'class'] });

export function RichSubtitle({ value, onChange, disabled }: { value: string; onChange: (html: string) => void; disabled: boolean }) {
  const editor = useRef<HTMLDivElement>(null);
  const selection = useRef<Range | null>(null);
  const [source, setSource] = useState(false);
  useEffect(() => {
    if (editor.current && document.activeElement !== editor.current && editor.current.innerHTML !== clean(value)) editor.current.innerHTML = clean(value);
  }, [value, source]);
  function rememberSelection() {
    const current = window.getSelection();
    if (current?.rangeCount && editor.current?.contains(current.anchorNode)) selection.current = current.getRangeAt(0).cloneRange();
  }
  function command(name: string, argument?: string) {
    editor.current?.focus();
    if (selection.current && editor.current?.contains(selection.current.commonAncestorContainer)) {
      const current = window.getSelection();
      current?.removeAllRanges();
      current?.addRange(selection.current);
    }
    document.execCommand(name, false, argument);
    rememberSelection();
    onChange(clean(editor.current?.innerHTML ?? ''));
  }
  const tools = [
    ['bold', 'B', 'Bold'], ['italic', 'I', 'Italic'], ['underline', 'U', 'Underline'], ['strikeThrough', 'S', 'Strikethrough'],
    ['justifyLeft', '≡', 'Align left'], ['justifyCenter', '≡', 'Align center'], ['justifyRight', '≡', 'Align right'],
    ['insertUnorderedList', '• List', 'Bulleted list'], ['insertOrderedList', '1. List', 'Numbered list'], ['unlink', '↛', 'Remove link'], ['removeFormat', 'Tx', 'Clear formatting'],
  ];
  return <div className="cms-rich-editor"><div className="cms-rich-toolbar" role="toolbar" aria-label="Subtitle formatting">
    {tools.map(([name, text, title]) => <button type="button" key={name} title={title} aria-label={title} disabled={disabled || source} onMouseDown={event => event.preventDefault()} onClick={() => command(name)} className={`rich-${name}`}>{text}</button>)}
    <button type="button" disabled={disabled || source} title="Insert link" aria-label="Insert link" onMouseDown={event => event.preventDefault()} onClick={() => { const url = window.prompt('Enter a site path, HTTP(S) or mailto: link'); if (url && /^(\/(?!\/)|#|https?:\/\/|mailto:)/.test(url)) command('createLink', url); }}>↗ Link</button>
    <button type="button" disabled={disabled} aria-pressed={source} className="cms-html-toggle" onClick={() => { if (source) onChange(clean(value)); setSource(!source); }}>〈/〉 HTML</button>
  </div>
    {source ? <textarea aria-label="Description HTML" disabled={disabled} rows={7} value={value} onChange={event => onChange(event.target.value)} /> : <div ref={editor} className="cms-rich-content" role="textbox" aria-label="Description / Subtitle" aria-multiline="true" contentEditable={!disabled} suppressContentEditableWarning onSelect={rememberSelection} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onInput={() => { rememberSelection(); onChange(editor.current?.innerHTML ?? ''); }} onPaste={event => { event.preventDefault(); document.execCommand('insertHTML', false, clean(event.clipboardData.getData('text/html') || event.clipboardData.getData('text/plain').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>'))); onChange(editor.current?.innerHTML ?? ''); }} />}
  </div>;
}
