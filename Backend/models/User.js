import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["Employee", "HR"],
      default: "Employee",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    department: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    salary: {
      type: Number,
      default: 0,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    dob: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    emergencyContact: {
      type: String,
      default: "",
    },

    emergencyPhone: {
      type: String,
      default: "",
    },

    joiningDate: {
      type: String,
      default: "",
    },

    reportingManager: {
      type: String,
      default: "",
    },

    basicPay: {
      type: Number,
      default: 0,
    },

    hra: {
      type: Number,
      default: 0,
    },

    allowances: {
      type: Number,
      default: 0,
    },

    deductions: {
      type: Number,
      default: 0,
    },

    documents: [
      {
        name: String,
        url: String,
      },
    ],

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;