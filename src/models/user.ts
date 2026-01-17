import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

export interface IUser {
  _id?: string;
  email: string;
  password?: string; 
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor ingresa un correo válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false, // Por seguridad, no devolvemos la contraseña en consultas normales
    },
  },
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;