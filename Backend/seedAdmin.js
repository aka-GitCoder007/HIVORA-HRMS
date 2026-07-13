import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = "admin_company@gmail.com";
    const password = "Admin_company123";

    // Check if user already exists
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = new User({
      employeeId: "ADM-001",
      name: "Company Admin",
      email: email,
      password: hashedPassword,
      role: "HR", // HR is the admin role in the schema
      isVerified: true,
      department: "Management",
    });

    await adminUser.save();
    console.log("Admin user seeded successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
