import { useEffect, useRef, useState } from "react";
import { Upload, Search, BarChart3, CheckCircle2, Play, ArrowRight, Brain, FileCheck, Zap, Shield, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import logo from "./assets/Small 1.png";

import { Link } from "react-router-dom";

const EduValidateLogo = () => (
  <Link to="/">
    <img src={logo} alt="EduValidate Logo" className="h-10 w-auto object-contain cursor-pointer" />
  </Link>
);

const FloatingIcon = ({ icon: Icon, className, delay = 0 }) => (
  <div
    className={`absolute opacity-20 ${className}`}
    style={{
      animation: `float 6s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  >
    <Icon className="w-8 h-8 text-white" />
  </div>
);

import screenshot1 from "./assets/screenshot1.png";
import screenshot2 from "./assets/screenshot2.png";

/* Improved ImageSlider: drag, wheel, keyboard, preserves UI */
const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [lastWheelTime, setLastWheelTime] = useState(0);
  const containerRef = useRef(null);
  const slidesRef = useRef(null);

  const slides = [
    {
      title: "Training Package Requirements",
      url: screenshot1
    },
    {
      title: "Evidence Produced",
      url: screenshot2
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pointer drag handlers
  useEffect(() => {
    const el = slidesRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      try { el.setPointerCapture(e.pointerId); } catch {}
      setIsDragging(true);
      setStartX(e.clientX);
      setDragX(0);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      setDragX(dx);
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const threshold = Math.min(window.innerWidth * 0.12, 100);
      if (dx < -threshold) nextSlide();
      else if (dx > threshold) prevSlide();
      setIsDragging(false);
      setStartX(0);
      setDragX(0);
      try { el.releasePointerCapture(e.pointerId); } catch {}
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, startX]);

  // Wheel navigation (throttled)
  const onWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime < 300) return;
    setLastWheelTime(now);
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
      if (e.deltaX > 0) nextSlide();
      if (e.deltaX < 0) prevSlide();
    } else {
      if (e.deltaY > 80) nextSlide();
      if (e.deltaY < -80) prevSlide();
    }
  };

  const translatePercent = -currentSlide * 100;
  const effectiveTranslate = `translateX(calc(${translatePercent}% + ${dragX}px))`;

  return (
    <div className="relative w-full max-w-5xl mx-auto" ref={containerRef}>
      <div className="relative overflow-hidden rounded-xl shadow-xl border border-gray-200 bg-white">
        <div
          ref={slidesRef}
          onWheel={onWheel}
          className={`flex transition-transform duration-500 ease-out ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{
            transform: effectiveTranslate,
            touchAction: 'pan-y',
            userSelect: 'none'
          }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full relative">
              <div className="aspect-[16/10] relative bg-gray-50">
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="w-full h-full object-contain p-1"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Minimal */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 z-10 border border-gray-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 z-10 border border-gray-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 p-2 rounded-full bg-white/50 backdrop-blur-sm">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-[#021B30] w-6' : 'bg-gray-400'}`}
            />
          ))}
        </div>
      </div>

      {/* Slide Counter */}
      <div className="text-center mt-6 text-gray-500 font-medium">
        <p>{slides[currentSlide].title}</p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* handleGetStarted removed in favor of inline navigation */

  const handleOrgSignup = () => {
    navigate("/org-login"); // new organization request page
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.03); }
        }
        @keyframes slide-diagonal {
          0% { transform: translateX(-100px) translateY(-100px); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translateX(100vw) translateY(100vh); opacity: 0; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Hero background: navy #021B30 with white accents */
        .gradient-bg {
          background: linear-gradient(135deg, #021B30 0%, #032E47 100%);
          position: relative;
          overflow: hidden;
        }
        .gradient-bg .hero-accent {
          position: absolute;
          border-radius: 9999px;
          filter: blur(30px);
          opacity: 0.08;
          animation: pulse-glow 6s ease-in-out infinite;
        }
        .gradient-bg .hero-accent.accent-1 {
          width: 220px;
          height: 220px;
          background: rgba(255,255,255,0.25);
          left: 6%;
          top: 12%;
          animation-delay: 0s;
        }
        .gradient-bg .hero-accent.accent-2 {
          width: 160px;
          height: 160px;
          background: rgba(255,255,255,0.15);
          right: 8%;
          top: 18%;
          animation-delay: 1.5s;
        }
        .gradient-bg .hero-accent.accent-3 {
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          left: 14%;
          bottom: 10%;
          animation-delay: 3s;
        }

        @keyframes slide-in-right {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .auth-form {
          animation: slide-in-right 0.8s ease-out;
        }
        .form-input {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .form-input:focus {
          background: white;
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 0 0 3px rgba(255,255,255,0.1);
        }

        .floating-elements {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        .diagonal-line {
          position: absolute;
          width: 2px;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.25), transparent);
          animation: slide-diagonal 8s linear infinite;
        }
        .diagonal-line:nth-child(1) { animation-delay: 0s; top: 10%; left: 10%; }
        .diagonal-line:nth-child(2) { animation-delay: 2s; top: 30%; right: 18%; }
        .diagonal-line:nth-child(3) { animation-delay: 4s; top: 50%; left: 30%; }
        .diagonal-line:nth-child(4) { animation-delay: 6s; top: 70%; right: 12%; }
        .section-badge {
          animation: fade-in-up 0.6s ease-out;
        }

        /* Modern "card stack" animation that replaces repeated documents */
        @keyframes card-stack-move {
          0% { transform: translateY(20px) rotate(-2deg) scale(0.98); opacity: 0; }
          20% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          60% { transform: translateY(-6px) rotate(1deg) scale(1.01); }
          100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        }
        .card-stack { animation: card-stack-move 3s ease-in-out infinite; }
        .card-card { transition: transform .4s ease, box-shadow .4s ease; }
        .card-card:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgba(2,27,48,0.18); }

        /* removed network rotation and moving nodes - replaced with subtle static accent */
        .network-svg { opacity: 0.95; filter: none; }
        .network-wrap { /* no rotation */ transform-origin: center; }

        /* stop feature icon rotation and slow down feature-card animation by ~30% (6s -> 8s) */
        @keyframes feature-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .feature-card {
          animation: feature-float 8s ease-in-out infinite; /* slowed ~30% */
        }
        /* remove the icon rotate animation completely to keep icons static */
        .feature-icon {
          animation: none !important;
          transform: none !important;
        }

        /* NEW: Minimal modern hero background animation (subtle moving radial accents) */
        .hero-bg-animated {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(2,27,48,0.06), transparent 12%),
            radial-gradient(circle at 85% 80%, rgba(3,46,71,0.06), transparent 14%),
            linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
          background-size: 120% 120%, 120% 120%, 100% 100%;
          animation: bg-shift 12s linear infinite;
          opacity: 0.95;
          mix-blend-mode: normal;
        }
        @keyframes bg-shift {
          0% {
            background-position: 0% 0%, 100% 100%, 0% 0%;
          }
          50% {
            background-position: 12% 8%, 88% 92%, 0% 0%;
          }
          100% {
            background-position: 0% 0%, 100% 100%, 0% 0%;
          }
        }
      `}</style>

      {/* Navigation - Futuristic Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/60 border-b border-white/20 shadow-sm">
        <style jsx>{`
          @keyframes nav-slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .nav-line {
            animation: nav-slide 3s linear infinite;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Empty space for logo that's now in hero */}
            <div className="flex items-center space-x-3">
  <EduValidateLogo />
  
</div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="relative text-gray-700 hover:text-[#021B30] font-semibold transition-colors duration-300 group">
                Features
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#021B30] to-[#032E47] group-hover:w-full transition-all duration-500"></div>
              </a>
              <a href="#pricing" className="relative text-gray-700 hover:text-[#021B30] font-semibold transition-colors duration-300 group">
                Pricing
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#021B30] to-[#032E47] group-hover:w-full transition-all duration-500"></div>
              </a>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 font-semibold text-[#021B30] hover:text-[#032E47] transition-colors duration-300 relative group"
                >
                  Log In
                  <div className="absolute inset-0 border border-[#021B30] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-[#021B30] to-[#032E47] rounded-lg hover:shadow-lg hover:shadow-blue-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </button>

                {/* New Smaller Org Signup Button - Same style & width as Sign Up */}
                <button
                  onClick={handleOrgSignup}
                  className="px-6 py-2 font-semibold text-white bg-gradient-to-r from-[#032E47] to-[#021B30] rounded-lg hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  Org Signup
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Futuristic Document Generation */}
      <section className="relative min-h-screen bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden flex items-center">
        <style jsx>{`
          @keyframes float-up {
            0% { transform: translateY(0px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-100px); opacity: 0; }
          }
          @keyframes document-flip {
            0% { transform: rotateY(0deg); }
            50% { transform: rotateY(180deg); }
            100% { transform: rotateY(360deg); }
          }
          @keyframes document-scan {
            0% { clip-path: polygon(0 0, 100% 0, 100% 0%, 0 0%); }
            100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
          }
          @keyframes scan-line {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes glow-pulse {
            0%, 100% { filter: none; }
            50% { filter: none; }
          }
          @keyframes logo-entrance {
            0% { opacity: 0; transform: scale(0.5) rotateY(180deg); }
            100% { opacity: 1; transform: scale(1) rotateY(0deg); }
          }
          @keyframes document-unfold {
            0% { opacity: 0; transform: perspective(1000px) rotateX(90deg) scale(0.8); }
            100% { opacity: 1; transform: perspective(1000px) rotateX(0deg) scale(1); }
          }
          @keyframes rotate-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0%, 100% { background-position: -200% center; }
            50% { background-position: 200% center; }
          }



          .float-particle {
            animation: float-up 6s ease-in infinite;
          }
          .document-flip {
            animation: document-flip 6s ease-in-out infinite;
          }
          .document-unfold {
            animation: document-unfold 1.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .scan-effect {
            animation: scan-line 3s linear infinite;
          }
          .pulse-ring {
            animation: pulse-ring 2s ease-out infinite;
          }
          .glow-pulse {
            filter: none;
            animation: none;
          }
          .logo-entrance {
            animation: logo-entrance 1s ease-out;
          }
          .rotate-animation {
            animation: rotate-slow 20s linear infinite;
          }
          .shimmer-text {
            background: linear-gradient(90deg, #021B30, #032E47, #021B30);
            background-size: 200% 100%;
            animation: shimmer 6s ease-in-out infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
        `}</style>

        {/* Animated Background Elements */}
        <div className="hero-bg-animated" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* subtle static rounded square accent using brand colors */}
          <div className="absolute left-8 top-16 w-80 h-80 pointer-events-none" aria-hidden>
            <div className="relative w-full h-full flex items-center justify-center">
              <div
                className="rounded-2xl"
                style={{
                  width: '240px',
                  height: '160px',
                  background: 'linear-gradient(135deg, rgba(2,27,48,0.04), rgba(3,46,71,0.03))',
                  border: '1px solid rgba(2,27,48,0.03)',
                  filter: 'none'
                }}
              />
            </div>
          </div>

          {/* Gradient blobs kept subtle and matching theme */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#edf7fb] to-[#e6f3fb] rounded-full blur-3xl opacity-12"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-[#f0f7fb] to-[#eef4fb] rounded-full blur-3xl opacity-10" style={{animationDelay: '1s'}}></div>

          {/* Scan lines effect */}
          <div className="absolute inset-0 opacity-5">
            <div className="scan-effect w-full h-1 bg-gradient-to-r from-transparent via-[#021B30] to-transparent absolute top-1/3"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
            
            {/* LEFT COLUMN: Content */}
            <div className="flex flex-col items-start justify-center text-left">
              {/* Logo (now STATIC) */}
              <div className="mb-10 relative" style={{perspective: '1000px'}}>
                <div className="document-unfold relative">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets%2F6160b6b467aa46839df0f4148d8bbdb5%2F37cb26da470943c1bf0a56152f8a4d2e?format=webp&width=800"
                    alt="EduValidate Logo"
                    className="relative w-[500px] h-auto"

                    style={{ filter: 'none', WebkitFilter: 'none' }}
                  />
                </div>
              </div>

              {/* Subheading */}
              <h2 className="text-2xl lg:text-4xl font-bold text-[#032E47] mb-6 leading-tight">
                AI-Driven Assessment<br />
                <span className="text-[#032E47]">Validation Platform</span>
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-700 mb-10 max-w-xl leading-relaxed">
                EduValidate is an AI-powered pre-assessment validation tool that
independently maps your assessment tools against training package
requirements and provides structured, evidence-based advice
—before your audit does.
              </p>

              {/* Stats */}
              <div className="flex gap-10 mb-10">
                <div className="relative group cursor-pointer">
                  <div className="relative">
                    <div className="text-3xl font-black text-[#021B30] group-hover:scale-110 transition-transform">99.2%</div>
                    <div className="text-sm text-gray-600">AI Accuracy</div>
                  </div>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="relative">
                    <div className="text-3xl font-black text-[#021B30] group-hover:scale-110 transition-transform">&lt;10min</div>
                    <div className="text-sm text-gray-600">Processing</div>
                  </div>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="relative">
                    <div className="text-3xl font-black text-[#021B30] group-hover:scale-110 transition-transform">1000+</div>
                    <div className="text-sm text-gray-600">Validated</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-row items-center gap-6">
                <button
                  onClick={() => navigate('/signup')}
                  className="relative group px-8 py-3 font-bold text-lg text-white bg-gradient-to-r from-[#021B30] to-[#032E47] rounded-lg hover:shadow-xl hover:shadow-blue-400/50 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative flex items-center">
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-3 font-bold text-lg text-[#021B30] hover:text-[#032E47] transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Clickable Sign In Card */}
<div className="flex items-center justify-center h-[600px]">
  <div 
    onClick={() => navigate('/login')}
    className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl"
  >
    <div className="bg-[#021B30] p-6 text-center">
      <h3 className="text-xl font-bold text-white mb-2">Welcome Back</h3>
      <p className="text-blue-200 text-sm">Please sign in to continue</p>
    </div>
    <div className="p-8 space-y-4">
      <div className="space-y-2">
        <div className="h-2 w-16 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-50 rounded border border-gray-200"></div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-16 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-50 rounded border border-gray-200"></div>
      </div>
      <div className="h-10 w-full bg-[#021B30] rounded mt-6 flex items-center justify-center text-white font-semibold">
        Sign In
      </div>
      <div className="text-center text-xs text-gray-400 mt-4">
        Don't have an account? <span className="text-[#021B30] font-bold">Sign Up</span>
      </div>
    </div>
  </div>
</div>

          </div>
        </div>
      </section>

      {/* Upload. Validate. Improve. Section - Enhanced */}
      <section className="py-24 bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
        <style jsx>{`
          @keyframes slide-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer-border {
            0%, 100% { border-color: #021B30; }
            50% { border-color: #032E47; }
          }
          .step-card {
            animation: slide-up 0.6s ease-out forwards;
            opacity: 0;
          }
          .step-card:nth-child(1) { animation-delay: 0.1s; }
          .step-card:nth-child(2) { animation-delay: 0.2s; }
          .step-card:nth-child(3) { animation-delay: 0.3s; }
          .step-card:nth-child(4) { animation-delay: 0.4s; }
        `}</style>

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-100 to-purple-100 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-[#021B30] rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-[#021B30] mr-3 animate-pulse" />
              <span className="text-[#021B30] font-bold">Smart Document Processing</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-[#021B30] mb-6">
              Upload. Validate. Improve.
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our intelligent four-step process transforms assessment validation from weeks to minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "1",
                title: "Log in to your dashboard",
                description: "Access your validation history and upload options.",
              },
              {
                number: "2",
                title: "Upload your assessment tools",
                description: "Submit documents for AI analysis of competency standards.",
              },
              {
                number: "3",
                title: "EduValidate maps your tool",
                description: "AI reviews your tool against compliance and standards.",
              },
              {
                number: "4",
                title: "Receive your Validation Report",
                description: "Get detailed PDF with compliance report and recommendations.",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="step-card relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#021B30]/5 to-[#032E47]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative border-2 border-[#021B30]/30 rounded-2xl p-8 bg-white/50 backdrop-blur-sm hover:border-[#021B30] transition-all duration-300 h-full">
                  <div className="text-6xl font-black bg-gradient-to-r from-[#021B30] to-[#032E47] bg-clip-text text-transparent mb-6">
                    {step.number}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Connection line to next card */}
                  {index < 3 && (
                    <div className="hidden lg:block absolute -right-6 top-1/2 w-12 h-0.5 bg-gradient-to-r from-[#021B30] to-transparent transform -translate-y-1/2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - AI Capabilities */}
      <section id="features" className="py-24 bg-gradient-to-b from-white via-purple-50 to-white relative overflow-hidden">
        <style jsx>{`
          @keyframes feature-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes icon-rotate {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }

          .feature-card {
            animation: feature-float 8s ease-in-out infinite;
          }

          .feature-icon {
            animation: none !important;
            transform: none !important;
          }
        `}</style>

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-tl from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-[#021B30] rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <Brain className="w-5 h-5 text-[#021B30] mr-3 animate-pulse" />
              <span className="text-[#021B30] font-bold">AI-Powered Intelligence</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-[#021B30] mb-6">How AI Powers EduValidate</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Advanced machine learning algorithms that analyze assessment tools with expert-level precision,
              delivering actionable insights in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative border-2 border-[#021B30]/20 rounded-3xl p-10 bg-white/50 backdrop-blur-sm hover:border-[#021B30] transition-all duration-300 h-full group-hover:shadow-2xl group-hover:shadow-blue-200/50">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-blue-400/50 transition-shadow">
                  <Upload className="w-10 h-10 text-white feature-icon" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Document Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  AI-powered analysis that extracts and understands content from multiple formats,
                  automatically mapping requirements to competency standards.
                </p>
              </div>
            </div>

            <div className="feature-card relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative border-2 border-[#021B30]/20 rounded-3xl p-10 bg-white/50 backdrop-blur-sm hover:border-[#021B30] transition-all duration-300 h-full group-hover:shadow-2xl group-hover:shadow-green-200/50">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-green-400/50 transition-shadow">
                  <Search className="w-10 h-10 text-white feature-icon" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Intelligent Gap Analysis</h3>
                <p className="text-gray-700 leading-relaxed">
                  Compare assessments against training.gov.au standards with expert precision,
                  identifying compliance gaps and improvement opportunities.
                </p>
              </div>
            </div>

            <div className="feature-card relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative border-2 border-[#021B30]/20 rounded-3xl p-10 bg-white/50 backdrop-blur-sm hover:border-[#021B30] transition-all duration-300 h-full group-hover:shadow-2xl group-hover:shadow-purple-200/50">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:shadow-purple-400/50 transition-shadow">
                  <BarChart3 className="w-10 h-10 text-white feature-icon" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Predictive Recommendations</h3>
                <p className="text-gray-700 leading-relaxed">
                  Personalized improvement suggestions based on successful assessment patterns,
                  helping achieve compliance faster than ever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Tests Section with Image Slider */}
      <section className="py-24 bg-gradient-to-br from-white via-cyan-50 to-white relative overflow-hidden">
        <style jsx>{`
          @keyframes slide-in-left {
            0% { opacity: 0; transform: translateX(-50px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes slide-in-right {
            0% { opacity: 0; transform: translateX(50px); }
            100% { opacity: 1; transform: translateX(0); }
          }

          .audit-title {
            animation: slide-in-left 0.8s ease-out;
          }
          .audit-description {
            animation: slide-in-right 0.8s ease-out 0.2s both;
          }
        `}</style>

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-300 to-blue-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-[#021B30] rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <FileCheck className="w-5 h-5 text-[#021B30] mr-3 animate-pulse" />
              <span className="text-[#021B30] font-bold">Audit-Grade Verification</span>
            </div>

            <h2 className="audit-title text-5xl lg:text-6xl font-black text-[#021B30] mb-6">
              AI-Powered Audit Tests
            </h2>
            <p className="audit-description text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              EduValidate isn’t about ticking boxes — it’s about transforming validation into a genuine quality improvement
process. Our AI doesn’t just check if your assessments meet the standards; it puts them through a series of
audit-style tests built by a compliance expert. You get a practical, easy-to-read report with recommendations you

can actually use to improve your tools and training outcomes.
            </p>
          </div>

          {/* Image Slider */}
          <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50">
            <ImageSlider />
          </div>
        </div>
      </section>

      {/* Pricing Section - Flexible Plans */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
        <style jsx>{`
          @keyframes price-pop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes popular-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(2, 27, 48, 0.3); }
            50% { box-shadow: 0 0 0 15px rgba(2, 27, 48, 0); }
          }

          .price-card {
            animation: price-pop 0.6s ease-out forwards;
            opacity: 0;
          }
          .price-card:nth-child(1) { animation-delay: 0.1s; }
          .price-card:nth-child(2) { animation-delay: 0.2s; }
          .price-card:nth-child(3) { animation-delay: 0.3s; }

          .popular-card {
            animation: popular-pulse 2s infinite;
          }
        `}</style>

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-200 to-purple-200 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-[#021B30] rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-[#021B30] mr-3 animate-pulse" />
              <span className="text-[#021B30] font-bold">Transparent Pricing</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black text-[#021B30] mb-6">
              One Annual Membership. Unlimited Confidence.
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Full access to validation tools, AI analysis, and downloadable audit-ready reports
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Lite",
                units: "10 validations",
                price: "$6,000",
                features: [
                  "10 annual validations",
                  "Basic reporting",
                  "Email support",
                  "Standard turnaround"
                ],
                popular: false
              },
              {
                name: "Pro",
                units: "25 validations",
                price: "$15,000",
                features: [
                  "25 annual validations",
                  "Advanced reporting",
                  "Priority support",
                  "Fast turnaround",
                  "Custom insights"
                ],
                popular: false
              },
              {
                name: "Premium",
                units: "Unlimited validations",
                price: "$22,000",
                features: [
                  "Unlimited validations",
                  "Premium reporting",
                  "24/7 dedicated support",
                  "Instant turnaround",
                  "Custom consulting",
                  "API access"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`price-card relative group ${plan.popular ? 'popular-card' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-[#021B30] to-[#032E47] text-white px-6 py-2 rounded-full text-sm font-black shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className={`relative rounded-3xl p-10 transition-all duration-300 h-full ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[#021B30] to-[#032E47] text-white shadow-2xl shadow-blue-400/50 md:scale-105 md:-mt-6 z-30'
                    : 'bg-white border-2 border-[#021B30]/20 hover:border-[#021B30] group-hover:shadow-2xl group-hover:shadow-blue-200/50'
                }`}>
                  <h3 className={`text-3xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-[#021B30]'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm font-semibold mb-8 ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                    {plan.units}
                  </p>

                  <div className="mb-10">
                    <span className={`text-5xl font-black ${plan.popular ? 'text-white' : 'text-[#021B30]'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm font-semibold ${plan.popular ? 'text-white/70' : 'text-gray-600'}`}>
                      /year
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className={`w-full mb-10 px-6 py-4 rounded-xl font-black text-lg transition-all duration-300 transform hover:scale-105 ${
                      plan.popular
                        ? 'bg-white text-[#021B30] hover:shadow-xl hover:shadow-white/50'
                        : 'bg-gradient-to-r from-[#021B30] to-[#032E47] text-white hover:shadow-lg hover:shadow-blue-400/50'
                    }`}
                  >
                    Get Started
                  </button>

                  <div className={`space-y-4 ${plan.popular ? 'text-white/90' : 'text-gray-700'}`}>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className={`w-6 h-6 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-white' : 'text-green-600'}`} />
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-700 text-lg">
              Need a custom plan? <a href="#" className="text-[#021B30] font-bold hover:text-[#032E47] transition-colors underline">Contact Now</a>
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Futuristic */}
      <section className="relative py-24 bg-gradient-to-br from-[#021B30] via-[#001d6e] to-[#032E47] overflow-hidden">
        <style jsx>{`
          @keyframes particle-rise {
            0% { opacity: 0; transform: translateY(100px) translateX(-50px); }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translateY(-100px) translateX(50px); }
          }
          @keyframes cta-scale {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }

          .particle {
            animation: particle-rise 8s ease-in infinite;
            position: absolute;
          }

          .cta-button {
            animation: cta-scale 3s ease-in-out infinite;
          }
        `}</style>

        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="particle w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + i * 12}%`,
                animationDelay: `${i * 1}s`
              }}
            ></div>
          ))}
        </div>

        {/* Gradient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-400 to-blue-500 rounded-full blur-3xl opacity-10"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-full px-6 py-3 mb-10 hover:bg-white/20 transition-colors duration-300">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-white font-bold">Ready to Transform Your Assessments?</span>
          </div>

          <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Join the Future of<br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Assessment Validation</span>
          </h2>

          <p className="text-xl lg:text-2xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
            Thousands of Australian training providers trust EduValidate's AI for faster,
            more accurate compliance validation with instant actionable insights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => navigate('/signup')}
              className="cta-button px-10 py-4 bg-white text-[#021B30] rounded-xl font-black text-lg hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-110 flex items-center gap-2"
            >
              Start Now
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* <button
              onClick={handleGetStarted}
              className="px-10 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Watch Demo
            </button> */}
          </div>

          <p className="text-white/60 text-sm mt-10">
            Driving Innovation in Assessment Validation
          </p>
        </div>
      </section>
    </div>
  );
}
