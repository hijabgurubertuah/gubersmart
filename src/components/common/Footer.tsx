import React from 'react';
import { CMSSettings } from '../../types';
import { Instagram, Youtube, Github } from 'lucide-react';

interface FooterProps {
  cms: CMSSettings;
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ cms, onNavigate }) => {
  const { footer, identity } = cms;

  return (
    <footer className="w-full bg-[#0B2A5B] text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-700/80">
          {/* Col 1: Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center text-[#0B2A5B] font-bold font-heading">
                G
              </div>
              <span className="font-heading font-bold text-lg text-white">
                {identity.appName}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {identity.tagline}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-sm">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              {cms.navigation
                .filter((item) => item.isVisible)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.path)}
                      className="hover:text-white transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Col 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-sm">
              Kontak
            </h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>{footer.address}</li>
              <li>{footer.phone}</li>
              <li>{footer.email}</li>
              <li>{footer.hours}</li>
            </ul>
          </div>

          {/* Col 4: Social Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-white text-sm">
              Sosial Media
            </h4>
            <div className="flex items-center gap-3">
              {footer.social.instagram && (
                <a
                  href={footer.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-[12px] bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {footer.social.youtube && (
                <a
                  href={footer.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-[12px] bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {footer.social.github && (
                <a
                  href={footer.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-[12px] bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>{footer.copyright}</p>
          <div className="flex gap-4">
            {cms.pages
              .filter((p) => p.isVisible)
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => onNavigate(`/halaman/${p.slug}`)}
                  className="hover:text-white transition-colors"
                >
                  {p.title}
                </button>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
