const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

export const escapeHtmlMultiline = (value: unknown): string => escapeHtml(value).replace(/\r?\n/g, '<br>');

export const singleLine = (value: unknown): string => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
