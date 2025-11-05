import express from 'express';
import SiteInfo from '../models/SiteInfo.js';
import Skill from '../models/Skill.js';
import Project from '../models/Project.js';
import SocialLink from '../models/SocialLink.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const site = await SiteInfo.getSingleton();
  const skills = await Skill.find().sort({ createdAt: 1 });
  const projects = await Project.find().sort({ createdAt: 1 });
  const social = await SocialLink.find().sort({ createdAt: 1 });
  res.json({ site, skills, projects, social });
});

export default router;