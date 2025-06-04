// apps/backend/src/models/User.ts
import mongoose from "mongoose";

export type UserRole = "USER" | "ADMIN";

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  name: string;          // = future clientName
  role: UserRole;
  createdAt: Date;       // из timestamps
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email:        { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name:         { type: String, required: true },
    role:         { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
