export const PHARMACIST_CREDENTIALS = {
  username: 'pharmacist',
  password: 'admin123',
};

export const HOSPITAL_NAME = 'City General Hospital';

export const WHATSAPP_MESSAGE = `Hello!

Your prescription has been processed and your medicines are ready for pickup.

Please collect them from the hospital pharmacy.

Thank you for using FastTrackRx.`;

export const WHATSAPP_COUNTRY_CODE = '91';

export const STATUS_LABELS = {
  Pending: 'Pending',
  Packing: 'Packing',
  Ready: 'Ready for Pickup',
} as const;

export type PrescriptionStatus = 'Pending' | 'Packing' | 'Ready';

export interface Prescription {
  id: number;
  whatsapp_number: string;
  prescription_file: string;
  file_name: string;
  status: PrescriptionStatus;
  created_at: string;
}
