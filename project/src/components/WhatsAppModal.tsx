import Modal from './Modal';
import { CheckCircle2, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface WhatsAppModalProps {
  open: boolean;
  onClose: () => void;
  whatsappNumber: string;
  message: string;
  waLink: string;
}

export default function WhatsAppModal({
  open,
  onClose,
  whatsappNumber,
  message,
  waLink,
}: WhatsAppModalProps) {
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    window.open(waLink, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const handleClose = () => {
    setSent(false);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="WhatsApp Notification"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-medical-100">
          <CheckCircle2 size={36} className="text-medical-600" />
        </div>

        {!sent ? (
          <>
            <p className="text-center text-lg font-bold text-medical-700">
              Ready to Send WhatsApp Message
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2">
              <MessageCircle size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{whatsappNumber}</span>
            </div>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Message Preview
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {message}
              </p>
            </div>
            <p className="text-center text-xs text-slate-400">
              Clicking the button below will open WhatsApp with the message pre-filled.
              Just tap Send in WhatsApp to deliver it to the patient.
            </p>
            <button onClick={handleSend} className="btn-primary w-full bg-[#25D366] shadow-[#25D366]/25 hover:bg-[#1ebe57]">
              <Send size={16} />
              Open WhatsApp & Send
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-lg font-bold text-medical-700">
              WhatsApp Opened Successfully
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2">
              <MessageCircle size={16} className="text-slate-500" />
              <span className="text-sm font-medium text-slate-700">{whatsappNumber}</span>
            </div>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Message Sent
              </p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                {message}
              </p>
            </div>
            <p className="text-center text-xs text-slate-400">
              WhatsApp has been opened in a new tab with the message pre-filled.
              If it didn't open, make sure WhatsApp is installed on your device.
            </p>
            <div className="flex w-full gap-3">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex-1"
              >
                <Loader2 size={16} className="opacity-0" />
                Reopen WhatsApp
              </a>
              <button onClick={handleClose} className="btn-primary flex-1">
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
