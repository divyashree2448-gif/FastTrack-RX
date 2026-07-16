import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import Logo from './Logo';
import { Download } from 'lucide-react';

interface QRCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
}

export default function QRCodeModal({ open, onClose, url }: QRCodeModalProps) {
  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'fasttrackrx-qr-code.svg';
    a.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <Modal open={open} onClose={onClose} title="Scan to Upload Prescription" maxWidth="max-w-md">
      <div className="flex flex-col items-center gap-5">
        <p className="text-center text-sm text-slate-600">
          Patients scan this QR code with their phone camera to open the prescription upload page.
        </p>
        <div className="rounded-3xl border-2 border-medical-100 bg-white p-6 shadow-lg shadow-medical-600/10">
          <QRCodeSVG
            id="qr-code-svg"
            value={url}
            size={220}
            level="M"
            bgColor="#ffffff"
            fgColor="#14532d"
            marginSize={0}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-medical-50 px-4 py-2">
          <Logo size="sm" />
        </div>
        <div className="w-full space-y-2">
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
            <p className="text-xs font-medium text-slate-400">QR Code links to</p>
            <p className="text-sm font-semibold text-medical-700">{url}</p>
          </div>
          <button onClick={downloadQR} className="btn-secondary w-full">
            <Download size={16} />
            Download QR Code
          </button>
        </div>
      </div>
    </Modal>
  );
}
