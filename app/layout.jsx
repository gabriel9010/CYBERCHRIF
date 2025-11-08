import "./globals.css";
import { orbitron, jetbrains } from "./fonts";
import Navbar from "../components/Navbar";
import NeonBackground from "../components/NeonBackground";
import ThemeProvider from "../components/ThemeProvider";
import CursorTrail from "../components/CursorTrail";

export const metadata = {
  title: "chrif — Portfolio Cyberpunk",
  description: "Progetti, esperimenti e vibes neon di chrif."
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className={`${orbitron.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-bg relative overflow-x-hidden noise cursor-neon">
        <ThemeProvider>
          <NeonBackground />
          <div className="scanlines pointer-events-none fixed inset-0"></div>
          <Navbar />
          <CursorTrail />
          <main className="relative">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
