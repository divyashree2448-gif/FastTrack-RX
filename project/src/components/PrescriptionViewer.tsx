import Modal from './Modal';
import { FileText, Download } from 'lucide-react';

interface PrescriptionViewerProps {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export default function PrescriptionViewer({ open, onClose, fileUrl, fileName }: PrescriptionViewerProps) {
  const isPdf = fileName.toLowerCase().endsWith('.pdf') || fileUrl.toLowerCase().includes('.pdf');

  return (
    <Modal open={open} onClose={onClose} title="Prescription Preview" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={18} className="shrink-0 text-medical-600" />
            <span className="truncate text-sm font-medium text-slate-700">{fileName}</span>
          </div>
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary shrink-0"
          >
            <Download size={16} />
            Download
          </a>
        </div>
        <div className="flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {isPdf ? (
            <iframe
              src={fileUrl}
              title="Prescription PDF"
              className="h-[60vh] w-full"
            />
          ) : (
            <img
              src={fileUrl}
              alt={fileName}
              className="max-h-[60vh] w-full object-contain"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
