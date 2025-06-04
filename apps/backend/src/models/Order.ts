// apps/backend/src/models/Order.ts
import mongoose from "mongoose";

export type OrderStatus =
  | "NEW"
  | "OFFERED"
  | "CONFIRMED"
  | "DECLINED"
  | "IN_PROGRESS"
  | "DONE";

export interface IOrder extends mongoose.Document {
  /* --- обовʼязкові поля --- */
  userId:    string;   // ідентифікатор аккаунта-замовника (СТО)
  clientName:string;   // читабельна назва сервіс-центру
  partType:  string;
  description:string;
  status:    OrderStatus;

  /* --- необовʼязкові поля --- */
  defectPrice?: number;
  repairPrice?: number;
  workHours?:  number;
  images:      string[];

  /* --- автоматичні поля (timestamps) --- */
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>(
  {
    userId:     { type: String, required: true },
    clientName: { type: String, required: true },          // 👈 нове поле
    partType:   { type: String, required: true },
    description:{ type: String, required: true },
    status:     {
      type: String,
      enum: ["NEW","OFFERED","CONFIRMED","DECLINED","IN_PROGRESS","DONE"],
      default: "NEW",
    },
    defectPrice:Number,
    repairPrice:Number,
    workHours:  Number,
    images:     [String],
  },
  { timestamps: true }   // створює createdAt / updatedAt
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
