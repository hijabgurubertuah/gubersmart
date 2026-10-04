import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingProps {
  phone: string;
}

export const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = ({ phone }) => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Halo Guber Smart, saya ingin bertanya tentang kelas.')}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all focus:outline-none"
      aria-label="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};
