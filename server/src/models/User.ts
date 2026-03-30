import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SB_TREASURER = 'SB_TREASURER',
  SOCIETY_ADMIN = 'SOCIETY_ADMIN',
  VIEWER = 'VIEWER',
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  societyId?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 4 },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.VIEWER,
    },
    societyId: { type: String, default: null },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password, ...rest } = ret;
    return rest;
  },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
