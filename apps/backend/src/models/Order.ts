import mongoose from 'mongoose';

export interface IOrder extends mongoose.Document {
  partType: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'DONE';
  defectPrice?: number;
  repairPrice?: number;
  workHours?: number;
  images: string[];
}

const orderSchema = new mongoose.Schema<IOrder>({
  partType: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['NEW', 'IN_PROGRESS', 'DONE'], default: 'NEW' },
  defectPrice: Number,
  repairPrice: Number,
  workHours: Number,
  images: [String],
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', orderSchema);
