import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // Importamos bcrypt

dotenv.config({ path: '.env.local' });

const seedData = async () => {
  try {
    const { default: dbConnect } = await import('./lib/dbConnect.ts');
    const { default: User } = await import('./models/user.ts');

    await dbConnect();
    console.log('🌱 Conectado a MongoDB...');

    // 2. CREAR USUARIO ADMIN
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('DASCORTEZcitypoint2025', salt); // CAMBIA ESTO por la contraseña que tú quieras usar realmente

    await User.create({
      email: 'dascortezsystem@hotmail.com',
      password: hashedPassword,
    });
    console.log('👤 Usuario Admin creado.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();