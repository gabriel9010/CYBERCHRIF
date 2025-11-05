import mongoose from 'mongoose';

const SiteInfoSchema = new mongoose.Schema({
  name: String,
  tagline: String,
  email: String,
  bio: String
}, { timestamps: true });

// Singleton helper
SiteInfoSchema.statics.getSingleton = async function() {
  const docs = await this.find().limit(1);
  if (docs.length > 0) return docs[0];
  return this.create({ name: 'CHRIF', tagline: 'Digital Creator & Tech Visionary', email: 'contact@chrif.net', bio: 'Bio iniziale' });
};

export default mongoose.model('SiteInfo', SiteInfoSchema);