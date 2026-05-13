import mongoose from 'mongoose';

export const mongoConnection = {
  async connect(uri: string): Promise<void> {
    mongoose.connection.on('connected', () => console.log('[MongoDB] Connected'));
    mongoose.connection.on('error', (err) => console.error('[MongoDB] Error:', err));
    mongoose.connection.on('disconnected', () => console.log('[MongoDB] Disconnected'));
    await mongoose.connect(uri);
  },

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  },
};
