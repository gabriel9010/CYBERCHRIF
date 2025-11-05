import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagline: String,
  brief_description: String,
  full_description: String,
  category: String,
  status: String,
  technologies: { type: [String], default: [] },
  tools: String,
  live_url: String,
  github_url: String,
  demo_url: String,
  client_name: String,
  role: String,
  team_size: String,
  duration: String,
  challenges: String,
  solutions: String,
  results: String,
  mainImage: String,
  galleryImages: { type: [String], default: [] },
  video_url: String,
  featured: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  link: String,
  image: String
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);