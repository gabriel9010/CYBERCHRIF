import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, required: true }
}, { timestamps: true });

export default mongoose.model('Skill', SkillSchema);