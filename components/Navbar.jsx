"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, Mail, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useState } from "react";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const LinkN = ({ href, children, onClick }) => (
    <a href={href} onClick={onClick}
       className="font-mono text-sm link-neon hover:text-neon-cyan block sm:inline">
      {children}
    </a>
  );

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur bg-bg/70 border-b border-cyan-500/20"
    >
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <a href="/" className="font-display text-lg sm:text-xl tracking-widest glitch neon-text" data-text="chrif">
          &lt;chrif/&gt;
        </a>

        {/* desktop nav */}
        <nav className="hidden sm:flex gap-6 items-center">
          <LinkN href="/">Home</LinkN>
          <LinkN href="/projects">Progetti</LinkN>
          <LinkN href="#about">About</LinkN>
          <LinkN href="#contact">Contatti</LinkN>

          <button aria-label="toggle theme" onClick={toggle} className="hover:text-neon-cyan">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="h-5 w-px bg-cyan-400/30" />
          <a href="https://github.com/chrif" target="_blank" aria-label="GitHub" className="hover:text-neon-cyan" rel="noreferrer"><Github size={18} /></a>
          <a href="https://linkedin.com/in/chrif" target="_blank" aria-label="LinkedIn" className="hover:text-neon-cyan" rel="noreferrer"><Linkedin size={18} /></a>
          <a href="mailto:hello@chrif.dev" aria-label="Email" className="hover:text-neon-cyan"><Mail size={18} /></a>
        </nav>

        {/* mobile actions */}
        <div className="flex sm:hidden items-center gap-3">
          <button aria-label="toggle theme" onClick={toggle} className="hover:text-neon-cyan">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button aria-label="menu" onClick={() => setOpen(true)} className="hover:text-neon-cyan">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur"
          >
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute right-0 top-0 h-full w-[78%] max-w-[360px] bg-bg border-l border-cyan-500/20 p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-lg neon-text">Menu</span>
                <button onClick={() => setOpen(false)} aria-label="close"><X /></button>
              </div>
              <div className="flex flex-col gap-4">
                <LinkN href="/" onClick={() => setOpen(false)}>Home</LinkN>
                <LinkN href="/projects" onClick={() => setOpen(false)}>Progetti</LinkN>
                <LinkN href="#about" onClick={() => setOpen(false)}>About</LinkN>
                <LinkN href="#contact" onClick={() => setOpen(false)}>Contatti</LinkN>
                <a href="https://github.com/chrif" target="_blank" rel="noreferrer" className="link-neon">GitHub</a>
                <a href="https://linkedin.com/in/chrif" target="_blank" rel="noreferrer" className="link-neon">LinkedIn</a>
                <a href="mailto:hello@chrif.dev" className="link-neon">Email</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
