import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Phone,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  X,
  Loader2,
  Building2,
  ShieldCheck,
  Clock,
  Lock,
} from 'lucide-react';
import Logo from '../components/Logo';
import { supabase, PRESCRIPTIONS_BUCKET } from '../lib/supabase';
import { HOSPITAL_NAME } from '../lib/constants';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 10;

export default function CustomerPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = useCallback(() => {
    setWhatsappNumber('');
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setIsSuccess(false);
    setError('');
  }, [previewUrl]);

  const handleFileSelect = (selectedFile: File | undefined) => {
    if (!selectedFile) return;

    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError('Please upload an image (JPG, PNG, WebP) or PDF file.');
      return;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError('');
    setFile(selectedFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (selectedFile.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      setError('Please enter your WhatsApp number.');
      return;
    }
    if (!file) {
      setError('Please upload your prescription.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `rx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(PRESCRIPTIONS_BUCKET)
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('prescriptions').insert({
        whatsapp_number: whatsappNumber.trim(),
        prescription_file: urlData.publicUrl,
        file_name: file.name,
        status: 'Pending',
      });

      if (insertError) throw insertError;

      setIsSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-medical-50 to-white">
        <div className="flex items-center justify-between px-6 py-5">
          <Logo size="md" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-fade-in-up text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-medical-100 shadow-lg shadow-medical-600/20">
              <CheckCircle2 size={52} className="text-medical-600" strokeWidth={2} />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              Prescription Uploaded Successfully
            </h1>
            <p className="mb-8 text-base leading-relaxed text-slate-600">
              Please wait for a WhatsApp notification. Your medicines will be prepared and
              you'll be notified when they're ready for pickup.
            </p>
            <div className="mb-8 space-y-3 rounded-2xl border border-medical-100 bg-medical-50/50 p-5 text-left">
              <div className="flex items-center gap-3">
                <Clock size={18} className="shrink-0 text-medical-600" />
                <span className="text-sm text-slate-700">Average wait: 10–15 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="shrink-0 text-medical-600" />
                <span className="text-sm text-slate-700">Your data is secure and private</span>
              </div>
            </div>
            <button onClick={resetForm} className="btn-primary w-full">
              Upload Another Prescription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-medical-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <Logo size="md" />
      </header>

      {/* Main content */}
      <div className="flex flex-1 items-start justify-center px-6 pb-12 pt-4 sm:items-center">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Hospital info */}
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-medical-100">
              <Building2 size={22} className="text-medical-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Hospital</p>
              <p className="text-sm font-bold text-slate-900">{HOSPITAL_NAME}</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Upload Your Prescription
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Submit your prescription before you reach the pharmacy to skip the queue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* WhatsApp number */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(formatPhoneNumber(e.target.value))}
                  placeholder="999 999 9999"
                  maxLength={12}
                  className="input-field pl-11"
                />
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                We'll notify you on WhatsApp when your medicines are ready.
              </p>
            </div>

            {/* File upload */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Upload Prescription
              </label>
              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-200 ${
                    isDragOver
                      ? 'border-medical-500 bg-medical-50'
                      : 'border-slate-300 bg-slate-50/50 hover:border-medical-400 hover:bg-medical-50/30'
                  }`}
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-medical-100">
                    <Upload size={26} className="text-medical-600" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Tap to upload or drag & drop
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    JPG, PNG, WebP, or PDF (max {MAX_SIZE_MB}MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 animate-scale-in">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Prescription preview"
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-50">
                        <FileText size={28} className="text-red-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="animate-slide-down rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Submit Prescription
                </>
              )}
            </button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} />
              Secure
            </span>
            <span className="flex items-center gap-1.5">
              <ImageIcon size={14} />
              Image & PDF
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              Skip the queue
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-5 text-center">
        <a
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-medical-600"
        >
          <Lock size={13} />
          Pharmacist Login
        </a>
      </footer>
    </div>
  );
}
