import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  RemoveFormatting,
  Maximize2,
  Minimize2,
  Code2,
  Type,
  Palette,
  Highlighter,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitize';
import { compressImageFile, uploadFileToDrive } from '../../services/appsScript';
import { store } from '../../services/store';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  onAutoSave?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Mulai tulis konten artikel, materi, atau deskripsi kelas di sini...',
  minHeight = '360px',
  onAutoSave,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHtmlSource, setIsHtmlSource] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');

  // Modals state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'full'>('center');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoInput, setVideoInput] = useState('');

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [tableHeader, setTableHeader] = useState(true);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  // Saved range for restoring selection after modal popup
  const savedSelectionRef = useRef<Range | null>(null);

  // Initialize editor content once or on external change when not active
  useEffect(() => {
    if (editorRef.current && !isHtmlSource) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlContent(value || '');
  }, [value, isHtmlSource]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
  };

  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setHtmlContent(html);
    onChange(html);
    if (onAutoSave) {
      onAutoSave();
    }
  }, [onChange, onAutoSave]);

  const exec = (command: string, value: string | undefined = undefined) => {
    if (isHtmlSource) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleContentChange();
  };

  const handleFormatBlock = (tag: string) => {
    exec('formatBlock', tag);
  };

  // Custom Insertions
  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    restoreSelection();
    const formattedUrl = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const textToInsert = linkText.trim() || formattedUrl;

    const html = `<a href="${formattedUrl}"${targetAttr} class="text-[#1E4FA8] dark:text-blue-400 underline font-medium hover:text-[#FF7A1A] transition-colors">${textToInsert}</a>`;
    document.execCommand('insertHTML', false, html);

    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    handleContentChange();
  };

  const handleInsertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    restoreSelection();
    let alignClass = 'mx-auto my-4';
    let containerClass = 'text-center';
    if (imageAlign === 'left') {
      alignClass = 'float-left mr-4 my-2 max-w-[50%]';
      containerClass = 'text-left';
    } else if (imageAlign === 'full') {
      alignClass = 'w-full my-4';
      containerClass = 'text-center w-full';
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic">${imageCaption.trim()}</figcaption>`
      : '';

    const figureHtml = `<figure class="my-4 ${containerClass}"><img src="${imageUrl}" alt="${imageCaption || 'Gambar'}" class="rounded-[12px] shadow-sm max-h-[480px] object-cover inline-block ${alignClass}" />${captionHtml}</figure><p><br></p>`;

    document.execCommand('insertHTML', false, figureHtml);

    setShowImageModal(false);
    setImageUrl('');
    setImageCaption('');
    setImageAlign('center');
    handleContentChange();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    try {
      const compressed = await compressImageFile(file, 1600, 0.85);
      const syncConfig = store.getCMS().sync;

      if (syncConfig?.webAppUrl && syncConfig.webAppUrl.trim().startsWith('https://script.google.com')) {
        const res = await uploadFileToDrive({
          file,
          compressedDataUrl: compressed.dataUrl,
          webAppUrl: syncConfig.webAppUrl,
          driveFolderId: syncConfig.driveFolderId,
        });

        if (res.status === 'success' && (res.directUrl || res.viewUrl)) {
          setImageUrl(res.directUrl || res.viewUrl || '');
          if (res.folderId && (!syncConfig.driveFolderId || syncConfig.driveFolderId !== res.folderId)) {
            store.updateSyncConfig({ driveFolderId: res.folderId });
          }
          return;
        }
      }

      // Fallback to compressed dataUrl if drive is not configured
      setImageUrl(compressed.dataUrl);
    } catch (err: any) {
      setImageUploadError(err.message || 'Gagal memproses gambar');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleInsertVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoInput.trim()) return;

    restoreSelection();
    let embedSrc = '';
    const input = videoInput.trim();

    // Check if input is iframe code
    if (input.includes('<iframe') && input.includes('src=')) {
      const match = input.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        embedSrc = match[1];
      }
    } else if (input.includes('youtube.com') || input.includes('youtu.be')) {
      let videoId = '';
      if (input.includes('youtu.be/')) {
        videoId = input.split('youtu.be/')[1]?.split('?')[0];
      } else if (input.includes('v=')) {
        videoId = input.split('v=')[1]?.split('&')[0];
      } else if (input.includes('/embed/')) {
        videoId = input.split('/embed/')[1]?.split('?')[0];
      }
      if (videoId) {
        embedSrc = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (input.includes('drive.google.com')) {
      embedSrc = input.replace('/view', '/preview');
    } else {
      embedSrc = input;
    }

    if (embedSrc) {
      const videoHtml = `<div class="aspect-video w-full max-w-3xl mx-auto my-6 rounded-[14px] overflow-hidden shadow-md bg-black"><iframe src="${embedSrc}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
      document.execCommand('insertHTML', false, videoHtml);
    }

    setShowVideoModal(false);
    setVideoInput('');
    handleContentChange();
  };

  const handleInsertTable = (e: React.FormEvent) => {
    e.preventDefault();
    restoreSelection();

    let tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm">';

    if (tableHeader) {
      tableHtml += '<thead><tr class="bg-slate-100 dark:bg-slate-800">';
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<th class="border border-slate-300 dark:border-slate-700 p-2.5 text-left font-bold text-slate-800 dark:text-white">Header ${c + 1}</th>`;
      }
      tableHtml += '</tr></thead>';
    }

    tableHtml += '<tbody>';
    for (let r = 0; r < tableRows; r++) {
      tableHtml += `<tr class="${r % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/40'}">`;
      for (let c = 0; c < tableCols; c++) {
        tableHtml += `<td class="border border-slate-300 dark:border-slate-700 p-2.5 text-slate-700 dark:text-slate-300">Kolom ${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table></div><p><br></p>';

    document.execCommand('insertHTML', false, tableHtml);
    setShowTableModal(false);
    handleContentChange();
  };

  const handleInsertTask = () => {
    const taskHtml = '<ul class="task-list list-none my-2 space-y-1.5"><li class="flex items-center gap-2"><input type="checkbox" class="w-4 h-4 rounded text-[#FF7A1A]" /> <span>Tugas baru</span></li></ul><p><br></p>';
    document.execCommand('insertHTML', false, taskHtml);
    handleContentChange();
  };

  const handleInsertDivider = () => {
    const hrHtml = '<hr class="my-6 border-t-2 border-slate-200 dark:border-slate-700" /><p><br></p>';
    document.execCommand('insertHTML', false, hrHtml);
    handleContentChange();
  };

  const colors = [
    '#000000', '#0F172A', '#0B2A5B', '#1E4FA8', '#2563EB', '#0D9488',
    '#16A34A', '#EAB308', '#FF7A1A', '#DC2626', '#9333EA', '#64748B',
  ];

  const bgColors = [
    '#FEF08A', '#BBF7D0', '#BAE6FD', '#DDD6FE', '#FED7AA', '#FECDD3',
    '#F1F5F9', '#334155', '#1E293B',
  ];

  return (
    <div
      className={`border border-slate-200 dark:border-slate-800 rounded-[14px] bg-white dark:bg-slate-900 flex flex-col transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none shadow-2xl p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md'
          : 'shadow-xs'
      }`}
    >
      {/* 1. TOP TOOLBAR */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 rounded-t-[14px]">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('undo')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('redo')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Headings / Typography dropdown */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <select
            onChange={(e) => handleFormatBlock(e.target.value)}
            defaultValue="p"
            className="h-8 px-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[8px] text-slate-700 dark:text-slate-300 focus:outline-none"
            title="Format Tipografi"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1 (H1)</option>
            <option value="h2">Heading 2 (H2)</option>
            <option value="h3">Heading 3 (H3)</option>
            <option value="h4">Heading 4 (H4)</option>
            <option value="blockquote">Blockquote</option>
            <option value="pre">Code Block</option>
          </select>
        </div>

        {/* Text Style: Bold, Italic, Underline, Strike, Sub, Sup */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('bold')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold transition-colors"
            title="Tebal (Bold)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('italic')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 italic transition-colors"
            title="Miring (Italic)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('underline')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 underline transition-colors"
            title="Garis Bawah (Underline)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('strikeThrough')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 line-through transition-colors"
            title="Coret (Strikethrough)"
          >
            <Strikethrough className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('subscript')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors"
            title="Subscript"
          >
            <Subscript className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('superscript')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs transition-colors"
            title="Superscript"
          >
            <Superscript className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyLeft')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Rata Kiri"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyCenter')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Rata Tengah"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyRight')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Rata Kanan"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('justifyFull')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Rata Kanan Kiri (Justify)"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>

        {/* Lists & Task */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertUnorderedList')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Daftar Simbol (Bullet List)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('insertOrderedList')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Daftar Angka (Numbered List)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleInsertTask}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Checklist / Task List"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette Popovers */}
        <div className="relative flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          {/* Text Color */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowColorPicker(!showColorPicker);
                setShowBgColorPicker(false);
              }}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Warna Teks"
            >
              <Palette className="w-4 h-4 text-[#FF7A1A]" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-white dark:bg-slate-800 rounded-[12px] shadow-xl border border-slate-200 dark:border-slate-700 grid grid-cols-4 gap-1.5 w-36">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      restoreSelection();
                      exec('foreColor', c);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSelection();
                setShowBgColorPicker(!showBgColorPicker);
                setShowColorPicker(false);
              }}
              className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Warna Sorotan (Highlight)"
            >
              <Highlighter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
            {showBgColorPicker && (
              <div className="absolute top-full left-0 mt-1 z-30 p-2.5 bg-white dark:bg-slate-800 rounded-[12px] shadow-xl border border-slate-200 dark:border-slate-700 grid grid-cols-3 gap-1.5 w-32">
                {bgColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      restoreSelection();
                      exec('hiliteColor', c);
                      setShowBgColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Insert Elements: Link, Image, Video, Table, Divider */}
        <div className="flex items-center gap-0.5 px-1 border-r border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setShowLinkModal(true);
            }}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Sisipkan Tautan (Link)"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setShowImageModal(true);
            }}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Sisipkan Gambar (Upload / URL)"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setShowVideoModal(true);
            }}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Embed Video (YouTube / Drive)"
          >
            <Video className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setShowTableModal(true);
            }}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Sisipkan Tabel Dinamis"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertDivider}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Garis Pemisah (Divider)"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Clear formatting, HTML code toggle & Fullscreen */}
        <div className="flex items-center gap-0.5 pl-1 ml-auto">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec('removeFormat')}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Hapus Pemformatan"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsHtmlSource(!isHtmlSource)}
            className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
              isHtmlSource
                ? 'bg-[#0B2A5B] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Lihat Kode HTML Source"
          >
            <Code2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={isFullscreen ? 'Keluar Layar Penuh (Esc)' : 'Layar Penuh / Distraction Free'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. MAIN EDITING AREA */}
      <div className="relative flex-1 flex flex-col">
        {isHtmlSource ? (
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value);
            }}
            className="w-full flex-1 p-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 focus:outline-none resize-none"
            style={{ minHeight }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onBlur={handleContentChange}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            className="w-full flex-1 p-5 focus:outline-none text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-relaxed overflow-y-auto prose dark:prose-invert max-w-none"
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* 1. Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#FF7A1A]" />
                Sisipkan Tautan (Link)
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertLink} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Teks Tautan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kunjungi Halaman Promo"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL Tujuan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF7A1A]"
                />
                <span>Buka di tab baru (_blank)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[10px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[10px]"
                >
                  Sisipkan Tautan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF7A1A]" />
                Sisipkan Gambar
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertImage} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Upload Gambar dari Perangkat
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[10px] flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isUploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FF7A1A]" />
                      <span>Mengunggah ke Drive...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Gambar</span>
                    </>
                  )}
                </button>
                {imageUploadError && (
                  <p className="text-xs text-rose-500 mt-1">{imageUploadError}</p>
                )}
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Atau Masukkan URL Gambar *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan / Caption Gambar (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Suasana ruang belajar..."
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Perataan & Lebar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setImageAlign('left')}
                    className={`h-8 rounded-[8px] text-xs font-medium border ${
                      imageAlign === 'left'
                        ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Kiri
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlign('center')}
                    className={`h-8 rounded-[8px] text-xs font-medium border ${
                      imageAlign === 'center'
                        ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Tengah
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageAlign('full')}
                    className={`h-8 rounded-[8px] text-xs font-medium border ${
                      imageAlign === 'full'
                        ? 'bg-[#0B2A5B] text-white border-[#0B2A5B]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Lebar Penuh
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[10px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[10px]"
                >
                  Sisipkan Gambar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Video Embed Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-[#FF7A1A]" />
                Embed Video
              </h4>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertVideo} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL YouTube, Google Drive, atau Kode Embed Iframe *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="https://www.youtube.com/watch?v=... atau <iframe src=...>"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[10px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[10px]"
                >
                  Embed Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-[#0B2A5B] dark:text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#FF7A1A]" />
                Sisipkan Tabel Dinamis
              </h4>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInsertTable} className="space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jumlah Baris
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jumlah Kolom
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[10px]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={tableHeader}
                  onChange={(e) => setTableHeader(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FF7A1A]"
                />
                <span>Gunakan Baris Header (Judul Kolom)</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-[10px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 text-xs font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[10px]"
                >
                  Sisipkan Tabel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
