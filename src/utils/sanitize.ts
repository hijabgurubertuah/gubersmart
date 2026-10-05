import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks while allowing rich text elements,
 * images, tables, formatting, and responsive video embeds (YouTube / Drive iframes).
 */
export const sanitizeHtml = (dirtyHtml: string): string => {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

  return DOMPurify.sanitize(dirtyHtml, {
    ADD_TAGS: ['iframe', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption', 'mark', 'hr', 'sub', 'sup'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'target',
      'rel',
      'class',
      'style',
      'src',
      'alt',
      'width',
      'height',
      'colspan',
      'rowspan',
      'align',
    ],
  });
};

/**
 * Calculates word count, character count, and estimated reading time.
 */
export const calculateContentStats = (htmlOrText: string) => {
  const text = htmlOrText ? htmlOrText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
  const charCount = text.length;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    charCount,
    wordCount,
    readTimeMinutes,
    plainText: text,
  };
};

/**
 * Converts a string into an SEO-friendly URL slug.
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-dan-') // Replace & with 'dan'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};
