import React from 'react';
import { CMSSettings } from '../../types';

interface ContactPageProps {
  cms: CMSSettings;
  onSubmitContact: (name: string, whatsapp: string, message: string) => void;
  onSuccessToast: (msg: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  return null;
};
