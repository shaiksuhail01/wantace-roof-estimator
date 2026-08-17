import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email =
      process.env.ADMIN_EMAIL ||
      'admin@northline.com';

    const password =
      process.env.ADMIN_PASSWORD ||
      'Admin@12345';

    const existingAdmin = await Admin.findOne({
      email,
    });

    if (existingAdmin) {
      console.log(
        `Admin already exists: ${email}`
      );

      process.exit(0);
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    await Admin.create({
      email,
      passwordHash,
      role: 'admin',
    });

    console.log(
      `Admin created successfully: ${email}`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      'Admin seeding failed:',
      error
    );

    process.exit(1);
  }
};

seedAdmin();