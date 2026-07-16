import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Clock,
  Package,
  CheckCircle2,
  LogOut,
  Eye,
  Play,
  Bell,
  Search,
  RefreshCw,
  QrCode,
  Phone,
  Calendar,
  FileText,
  Loader2,
  Inbox,
} from 'lucide-react';
import Logo from '../components/Logo';
import QRCodeModal from '../components/QRCodeModal';
import WhatsAppModal from '../components/WhatsAppModal';
import PrescriptionViewer from '../components/PrescriptionViewer';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { HOSPITAL_NAME, type Prescription, type PrescriptionStatus } from '../lib/constants';
import { sendWhatsAppNotification, getStatusColor, getStatusDot, formatDateTime } from '../lib/utils';

const POLL_INTERVAL = 5000;

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PrescriptionStatus>('all');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Modals
  const [qrOpen, setQrOpen] = useState(false);
  const [whatsappModal, setWhatsappModal] = useState<{ open: boolean; number: string; message: string; waLink: string }>({
    open: false,
    number: '',
    message: '',
    waLink: '',
  });
  const [viewerModal, setViewerModal] = useState<{ open: boolean; url: string; name: string }>({
    open: false,
    url: '',
    name: '',
  });

  // Action loading state per prescription
  const [actionLoading, setActionLoading] = useState<Record<number, string>>({});
  const [actionSuccess, setActionSuccess] = useState<Record<number, string>>({});

  const fetchPrescriptions = useCallback(async (silent = false) => {
    if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setPrescriptions(data as Prescription[]);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(() => fetchPrescriptions(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrescriptions]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const updateStatus = async (id: number, newStatus: PrescriptionStatus) => {
    setActionLoading((prev) => ({ ...prev, [id]: newStatus }));
    setActionSuccess((prev) => ({ ...prev, [id]: '' }));

    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state immediately for instant feedback
      setPrescriptions((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
      );

      if (newStatus === 'Ready') {
        const prescription = prescriptions.find((p) => p.id === id);
        if (prescription) {
          const result = await sendWhatsAppNotification(prescription.whatsapp_number, id);
          if (result.success) {
            setWhatsappModal({
              open: true,
              number: prescription.whatsapp_number,
              message: result.message,
              waLink: result.waLink,
            });
          }
          setActionSuccess((prev) => ({ ...prev, [id]: 'Ready for Pickup — WhatsApp sent!' }));
          setTimeout(() => {
            setActionSuccess((prev) => ({ ...prev, [id]: '' }));
          }, 4000);
        }
      } else if (newStatus === 'Packing') {
        setActionSuccess((prev) => ({ ...prev, [id]: 'Status updated to Packing' }));
        setTimeout(() => {
          setActionSuccess((prev) => ({ ...prev, [id]: '' }));
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setActionSuccess((prev) => ({ ...prev, [id]: 'Failed to update. Please retry.' }));
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Derived stats
  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === 'Pending').length,
    packing: prescriptions.filter((p) => p.status === 'Packing').length,
    ready: prescriptions.filter((p) => p.status === 'Ready').length,
  };

  // Filtered prescriptions
  const filtered = prescriptions.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.whatsapp_number.includes(searchQuery) ||
      p.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const customerUrl = typeof window !== 'undefined' ? `${window.location.origin}/rx` : '';

  const summaryCards = [
    {
      label: 'Total Orders',
      value: stats.total,
      icon: LayoutDashboard,
      color: 'text-slate-700',
      bg: 'bg-slate-100',
      ring: 'ring-slate-200',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      ring: 'ring-amber-200',
    },
    {
      label: 'Packing',
      value: stats.packing,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      ring: 'ring-blue-200',
    },
    {
      label: 'Ready for Pickup',
      value: stats.ready,
      icon: CheckCircle2,
      color: 'text-medical-600',
      bg: 'bg-medical-100',
      ring: 'ring-medical-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-slate-400">Pharmacy Dashboard</p>
              <p className="text-sm font-bold text-slate-700">{HOSPITAL_NAME}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQrOpen(true)}
              className="btn-secondary"
              title="Show QR Code"
            >
              <QrCode size={16} />
              <span className="hidden sm:inline">QR Code</span>
            </button>
            <button onClick={handleLogout} className="btn-secondary text-red-600 hover:bg-red-50">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Prescription Queue
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage incoming prescriptions and notify patients when ready.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-medical-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-medical-500" />
              </span>
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
            </div>
            <button
              onClick={() => fetchPrescriptions()}
              disabled={isRefreshing}
              className="btn-secondary"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`card flex items-center gap-3 p-4 ring-1 ${card.ring} transition-all duration-200 hover:shadow-md`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon size={24} className={card.color} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
                <p className="truncate text-xs font-medium text-slate-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by WhatsApp number or file name..."
              className="input-field pl-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'Pending', 'Packing', 'Ready'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  statusFilter === filter
                    ? 'bg-medical-600 text-white shadow-md shadow-medical-600/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter === 'all' ? 'All' : filter === 'Ready' ? 'Ready for Pickup' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Prescription list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-medical-500" />
            <p className="mt-4 text-sm text-slate-500">Loading prescriptions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Inbox size={32} className="text-slate-400" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              {prescriptions.length === 0 ? 'No prescriptions yet' : 'No matching prescriptions'}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {prescriptions.length === 0
                ? 'New uploads from patients will appear here automatically.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((rx, index) => (
              <div
                key={rx.id}
                className="card flex flex-col p-5 animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              >
                {/* Card header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusColor(
                        rx.status,
                      )}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDot(rx.status)}`} />
                      {rx.status === 'Ready' ? 'Ready for Pickup' : rx.status}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">#{rx.id}</span>
                </div>

                {/* Patient info */}
                <div className="mb-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={15} className="shrink-0 text-slate-400" />
                    <span className="font-semibold text-slate-700">{rx.whatsapp_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={15} className="shrink-0 text-slate-400" />
                    <span className="text-slate-500">{formatDateTime(rx.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText size={15} className="shrink-0 text-slate-400" />
                    <span className="truncate text-slate-500">{rx.file_name}</span>
                  </div>
                </div>

                {/* Preview thumbnail */}
                <div className="mb-4 flex-1">
                  {rx.prescription_file.toLowerCase().endsWith('.pdf') ||
                  rx.prescription_file.includes('.pdf') ? (
                    <div className="flex h-32 items-center justify-center rounded-xl bg-red-50">
                      <div className="flex flex-col items-center gap-1">
                        <FileText size={32} className="text-red-400" />
                        <span className="text-xs font-medium text-red-500">PDF Document</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={rx.prescription_file}
                        alt={rx.file_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                {/* Success message */}
                {actionSuccess[rx.id] && (
                  <div className="mb-3 animate-slide-down rounded-lg bg-medical-50 px-3 py-2 text-xs font-semibold text-medical-700">
                    {actionSuccess[rx.id]}
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() =>
                      setViewerModal({ open: true, url: rx.prescription_file, name: rx.file_name })
                    }
                    className="btn-secondary w-full"
                  >
                    <Eye size={16} />
                    View Prescription
                  </button>

                  {rx.status === 'Pending' && (
                    <button
                      onClick={() => updateStatus(rx.id, 'Packing')}
                      disabled={actionLoading[rx.id] !== undefined}
                      className="btn-primary w-full bg-blue-600 shadow-blue-600/25 hover:bg-blue-700"
                    >
                      {actionLoading[rx.id] === 'Packing' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Play size={16} />
                      )}
                      Start Packing
                    </button>
                  )}

                  {rx.status === 'Packing' && (
                    <button
                      onClick={() => updateStatus(rx.id, 'Ready')}
                      disabled={actionLoading[rx.id] !== undefined}
                      className="btn-primary w-full"
                    >
                      {actionLoading[rx.id] === 'Ready' ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Bell size={16} />
                      )}
                      Ready for Pickup
                    </button>
                  )}

                  {rx.status === 'Ready' && (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-medical-50 px-4 py-2.5 text-sm font-semibold text-medical-700">
                      <CheckCircle2 size={16} />
                      Patient notified via WhatsApp
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <QRCodeModal open={qrOpen} onClose={() => setQrOpen(false)} url={customerUrl} />
      <WhatsAppModal
        open={whatsappModal.open}
        onClose={() => setWhatsappModal({ open: false, number: '', message: '', waLink: '' })}
        whatsappNumber={whatsappModal.number}
        message={whatsappModal.message}
        waLink={whatsappModal.waLink}
      />
      <PrescriptionViewer
        open={viewerModal.open}
        onClose={() => setViewerModal({ open: false, url: '', name: '' })}
        fileUrl={viewerModal.url}
        fileName={viewerModal.name}
      />
    </div>
  );
}
