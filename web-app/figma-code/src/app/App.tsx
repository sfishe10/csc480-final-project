import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import dogImage from "figma:asset/fdb8fe7ce1f26ed473f07e885cd8b2e372321b96.png";

export default function App() {
  return (
    <div 
      className="h-screen w-full bg-[#FAFAF8] overflow-hidden relative flex flex-col"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Background Pattern - Subtle Dog Emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Scattered emojis at low opacity */}
        <div className="absolute top-[10%] left-[8%] text-6xl opacity-10">🐾</div>
        <div className="absolute top-[15%] right-[12%] text-5xl opacity-10">🦴</div>
        <div className="absolute top-[70%] left-[15%] text-5xl opacity-10">🐕</div>
        <div className="absolute top-[25%] left-[75%] text-6xl opacity-10">🐾</div>
        <div className="absolute top-[60%] right-[20%] text-5xl opacity-10">🦴</div>
        <div className="absolute top-[80%] right-[8%] text-6xl opacity-10">🐾</div>
        <div className="absolute top-[40%] left-[5%] text-5xl opacity-10">🐕</div>
        <div className="absolute top-[35%] right-[85%] text-5xl opacity-10">🦴</div>
        <div className="absolute bottom-[15%] left-[70%] text-5xl opacity-10">🐕</div>
      </div>

      {/* Nav Bar */}
      <nav className="relative z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-[#1A1A2E]"
          >
            Find Your Fetch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm text-[#6B7280]"
          >
            AI-Powered Breed Matching
          </motion.p>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Giant Dog Emoji */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 flex justify-center"
          >
            <img src={dogImage} alt="Service Dog" className="w-[280px] h-[280px] object-contain" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-[56px] leading-[1.1] font-bold text-[#1A1A2E] mb-6 tracking-tight"
          >
            Discover Your Perfect Dog.
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-[#6B7280] mb-10 max-w-2xl mx-auto"
            style={{ fontWeight: 500 }}
          >
            Answer 10 quick questions. Get your ideal breed match — powered by AI.
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B35] text-white rounded-full font-semibold text-lg shadow-[0_8px_24px_rgba(255,107,53,0.25)] hover:shadow-[0_12px_32px_rgba(255,107,53,0.35)] transition-shadow duration-300"
          >
            Start the Quiz
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          {/* Stat Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
          >
            <div className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#6B7280] shadow-sm border border-gray-100">
              200+ Breeds
            </div>
            <div className="text-[#6B7280]">·</div>
            <div className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#6B7280] shadow-sm border border-gray-100">
              10 Questions
            </div>
            <div className="text-[#6B7280]">·</div>
            <div className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#6B7280] shadow-sm border border-gray-100">
              Instant Results
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}