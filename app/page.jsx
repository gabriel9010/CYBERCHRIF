"use client";
import Hero from "../components/Hero";
import Projects from "../components/Projects";
import About from "../components/About";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <Hero />
      <motion.section id="projects" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}
        className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Projects limit={4} title="Ultimi progetti" showCTA />
      </motion.section>
      <motion.section id="about" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <About />
      </motion.section>
      <motion.section id="contact" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="container mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Contact />
      </motion.section>
      <Footer />
    </>
  );
}
