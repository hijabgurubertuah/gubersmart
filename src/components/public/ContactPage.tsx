import React, { useState } from 'react';
import { CMSSettings } from '../../types';
import { MessageCircle, Mail, MapPin, Send, Loader2 } from 'lucide-react';

interface ContactPageProps {
  cms: CMSSettings;
  onSubmitContact: (name: string, whatsapp: string, message: string) => void;
  onSuccessToast: (msg: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  cms,
  onSubmitContact,
  onSuccessToast,
}) => {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const cleanPhone = cms.identity.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Halo Guber Smart, saya ingin berkonsultasi.')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!whatsapp.trim()) newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    if (!message.trim()) newErrors.message = 'Pesan wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      onSubmitContact(name.trim(), whatsapp.trim(), message.trim());
      setIsLoading(false);
      setName('');
      setWhatsapp('');
      setMessage('');
      onSuccessToast('Pesan berhasil terkirim');
    }, 300);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-[#0B2A5B] dark:text-white">
          Hubungi Kami
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Contact info & Quick WhatsApp */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white">
              Saluran Komunikasi
            </h2>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#1E4FA8] shrink-0" />
                <span>{cms.footer.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#1E4FA8] shrink-0" />
                <span>{cms.footer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#1E4FA8] shrink-0" />
                <span>{cms.footer.phone}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] px-6 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20ba5a] rounded-[14px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                Chat WhatsApp Langsung
              </a>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white dark:bg-slate-900 rounded-[14px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold font-heading text-[#0B2A5B] dark:text-white mb-6">
            Kirim Pesan
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A] ${
                  errors.name ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  if (errors.whatsapp) setErrors({ ...errors, whatsapp: '' });
                }}
                className={`w-full h-11 px-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A] ${
                  errors.whatsapp ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.whatsapp && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.whatsapp}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Pesan *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                className={`w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border rounded-[14px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40 focus:border-[#FF7A1A] resize-none ${
                  errors.message ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs font-medium text-rose-600">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] font-semibold text-white bg-[#FF7A1A] hover:bg-[#E56A10] rounded-[14px] flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Pesan
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
