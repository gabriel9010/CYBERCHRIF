import mongoose from 'mongoose';

const SocialLinkSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: String
}, { timestamps: true });

export default mongoose.model('SocialLink', SocialLinkSchema);