export type UserRole = 'CLIENT' | 'CONTRACTOR' | 'ADMIN';

export interface OrderDTO {
  id?: string;
  partType: string;
  description: string;
  status?: 'NEW' | 'IN_PROGRESS' | 'DONE';
  defectPrice?: number;
  repairPrice?: number;
  workHours?: number;
  images?: string[];
}
