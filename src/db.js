import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI mancante nel file .env');
  process.exit(1);
}

export async function connectDB() {
  await mongoose.connect(uri, {
    autoIndex: true
  });
  console.log('Connesso a MongoDB');
}

// Schemi & Modelli
import './models/User.js';
import './models/SiteInfo.js';
import './models/Skill.js';
import './models/Project.js';
import './models/SocialLink.js';
import './models/Message.js';