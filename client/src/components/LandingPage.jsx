import { useEffect, useRef, useState } from "react";
import { Upload, Search, BarChart3, CheckCircle2, Play, ArrowRight, Brain, FileCheck, Zap, Shield, ChevronLeft, ChevronRight, FileText, Hourglass, Rocket, TrendingDown, Users, AlertTriangle, Lock, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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
    <div className="relative w-full max-w-6xl mx-auto" ref={containerRef}>
      <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-100 bg-white/50 backdrop-blur-md">
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
              <div className="aspect-[16/9] relative bg-transparent flex items-center justify-center p-6">
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-gray-100 bg-white"
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scrollY, setScrollY] = useState(0);

  // Demo Modal Form states
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoRto, setDemoRto] = useState("");
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingDemo(true);
    try {
      const response = await fetch("/api/request-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: demoName,
          email: demoEmail,
          rtoName: demoRto,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Demo Request Submitted",
          description: "Thank you! We have received your demo request and will email you shortly.",
        });
        setIsDemoModalOpen(false);
        setDemoName("");
        setDemoEmail("");
        setDemoRto("");
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error occurred",
        description: "Could not connect to the server. Please try again later.",
      });
    } finally {
      setIsSubmittingDemo(false);
    }
  };

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

                {/* Try Free Validation Button */}
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 font-bold text-white bg-[#00cfa7] hover:bg-[#00bda0] rounded-full hover:shadow-lg hover:shadow-emerald-400/40 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  Try free validation ↗
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
                Your compliance team just got a head start
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-700 mb-10 max-w-xl leading-relaxed">
                EduValidate is an AI-powered pre-assessment validation tool that independently reviews and maps your assessment tools against the training package requirements, Principles of Assessment and Rules of Evidence and provides structured, evidence-based advice- designed by an experienced regulatory auditor.
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
                  onClick={() => setIsDemoModalOpen(true)}
                  className="relative group px-8 py-4 font-bold text-lg text-white bg-[#00cfa7] hover:bg-[#00bda0] rounded-lg hover:shadow-xl hover:shadow-emerald-400/40 transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative flex items-center">
                    Request your demo
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                  </span>
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

      {/* Your Validation workflow Section */}
      <section className="py-24 bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-blue-100 to-purple-100 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-black text-[#021B30] mb-6">
              Your Validation workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                number: "Step 1",
                text: "Upload your Assessment documents",
                actor: "RTO team",
                icon: Upload
              },
              {
                number: "Step 2",
                text: "EduValidate analyses against multiple audit tests designed by an auditor",
                actor: "EduValidate",
                icon: Search
              },
              {
                number: "Step 3",
                text: "EduValidate delivers a report with gaps identified risks and recommendations for improvement",
                actor: "EduValidate",
                icon: FileText
              },
              {
                number: "Step 4",
                text: "The RTO team (compliance, trainers assessors etc) evaluates the findings and decides on actions",
                actor: "RTO team",
                icon: Users
              },
              {
                number: "Step 5",
                text: "The assessment is approved by the RTO for implementation",
                actor: "RTO team",
                icon: CheckCircle2
              }
            ].map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className="relative group flex flex-col justify-between border-2 border-[#021B30]/20 rounded-2xl p-6 bg-white hover:border-[#021B30] hover:shadow-xl transition-all duration-300 h-full"
                >
                  <div>
                    {/* Top: Step Indicator */}
                    <div className="text-sm font-black text-gray-400 uppercase tracking-wider mb-2">
                      {step.number}
                    </div>

                    {/* Step Title/Description */}
                    <p className="font-bold text-gray-900 leading-snug mb-6 text-[15px]">
                      {step.text}
                    </p>
                  </div>

                  <div>
                    {/* Icon Container */}
                    <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center mb-6 text-[#021B30] group-hover:bg-[#021B30] group-hover:text-white transition-colors duration-300">
                      <IconComponent className="w-6 h-6" />
                    </div>

                    {/* Responsibility Label */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                      {step.actor}
                    </div>
                  </div>

                  {/* Horizontal Arrow Line for Large screens (only for steps 1-4) */}
                  {index < 4 && (
                    <div className="hidden lg:block absolute -right-4 top-[35%] w-8 h-0.5 bg-gray-200 z-20"></div>
                  )}
                </div>
              );
            })}
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
      <section className="py-14 bg-gradient-to-br from-white via-cyan-50 to-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-300 to-blue-200 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-blue-200 to-cyan-100 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading and Description */}
            <div className="lg:col-span-5 text-left">
              <h2 className="text-4xl lg:text-5xl font-black text-[#021B30] mb-6 leading-tight">
                See what an auditor would find in your assessments
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Upload your assessment and receive a structured validation report identifying compliance risks, evidence gaps and quality issues before audit.
              </p>
            </div>

            {/* Right Column: Image Slider */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-200/50">
                <ImageSlider />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find the issues before audit does Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Title and Blurb */}
            <div className="lg:col-span-5 text-left">
              <h2 className="text-4xl lg:text-5xl font-black text-[#021B30] mb-6 leading-tight">
                Find the issues before audit does
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                EduValidate makes assessment risk visible early, giving your team the opportunity to improve quality before learners commence.
              </p>
            </div>

            {/* Right Column: Stacked Risk Cards */}
            <div className="lg:col-span-7 space-y-4">
              {[
                "Missing or weak performance evidence tasks",
                "Misalignment between knowledge evidence and assessment tasks",
                "Unclear assessment instructions that may affect evidence quality",
                "Assessment conditions that do not reflect unit requirements",
                "Language, accessibility barriers for learners"
              ].map((risk, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-3"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-gray-800 text-base">{risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Validate before delivery & Non-compliance Section */}
      <section className="py-24 bg-[#021B30] text-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-400 to-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-400 to-blue-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Part 1: Validate before delivery */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            Validate before delivery
          </h2>
          <p className="text-lg lg:text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            See how EduValidate strengthens assessment quality, reduces compliance risk and supports confident governance in your RTO.
          </p>
          <button
            onClick={() => setIsDemoModalOpen(true)}
            className="px-10 py-4 bg-[#00cfa7] hover:bg-[#00bda0] text-white rounded-xl font-black text-lg hover:shadow-2xl hover:shadow-emerald-400/40 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            Request your demo &rarr;
          </button>
        </div>

        {/* Part 2: Non-compliance isn't just an audit problem */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Column: Heading, Blurb and the 3 text cards */}
            <div className="lg:col-span-5 flex flex-col justify-start text-left space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
                  Non-compliance isn't just an audit problem.
                </h2>
                <p className="text-lg text-blue-100/80 leading-relaxed">
                  For Australian RTOs, a single ASQA non-compliance finding triggers a cascade of consequences — most of which cost far more than prevention.
                </p>
              </div>

              {/* Text cards vertical stack */}
              <div className="space-y-4 w-full">
                {/* Card 1: Re-registration delays */}
                <div className="bg-[#032E47]/60 border border-blue-900/30 rounded-2xl p-6 hover:border-blue-700/50 transition-all duration-300">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-2">Re-registration delays</h4>
                      <p className="text-sm text-blue-100/70 leading-relaxed">
                        Non-compliant RTOs face conditions, additional audits, and re-registration delays that can run 6–18 months.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 5: Remediation costs */}
                <div className="bg-[#032E47]/60 border border-blue-900/30 rounded-2xl p-6 hover:border-blue-700/50 transition-all duration-300">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-2">Remediation costs</h4>
                      <p className="text-sm text-blue-100/70 leading-relaxed">
                        Emergency consultant engagement, resource rewrites, and assessor retraining after a finding typically exceeds your annual EduValidate subscription many times over.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 6: Reputational damage */}
                <div className="bg-[#032E47]/60 border border-blue-900/30 rounded-2xl p-6 hover:border-blue-700/50 transition-all duration-300">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-2">Reputational damage</h4>
                      <p className="text-sm text-blue-100/70 leading-relaxed">
                        ASQA publishes compliance outcomes. Students, employers, and funding bodies check. One finding affects enrolment pipelines for years.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 3 stats cards side-by-side (vertical stack on small screens, 3 cols on large) */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-4 items-start lg:pt-16">
              {/* Card 2: 47% */}
              <div className="bg-[#032E47]/40 border border-blue-900/20 rounded-2xl p-5 hover:border-blue-700/30 transition-all duration-300 flex flex-col gap-6">
                <div>
                  <div className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-cyan-400 mb-3">47%</div>
                  <p className="text-sm text-blue-100/80 leading-relaxed mb-0">
                    of RTOs found non-compliant on trainer/assessor credentials in ASQA audits
                  </p>
                </div>
                <div className="text-xs text-blue-100/40 uppercase tracking-wider font-semibold">
                  SOURCE: ASQA ANNUAL REPORT
                </div>
              </div>

              {/* Card 3: 2yrs */}
              <div className="bg-[#032E47]/40 border border-blue-900/20 rounded-2xl p-5 hover:border-blue-700/30 transition-all duration-300 flex flex-col gap-6">
                <div>
                  <div className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-cyan-400 mb-3">2yrs</div>
                  <p className="text-sm text-blue-100/80 leading-relaxed mb-0">
                    Assessment evidence must now be retained under the 2025 Standards
                  </p>
                </div>
                <div className="text-xs text-blue-100/40 uppercase tracking-wider font-semibold">
                  STANDARDS FOR RTOs 2025
                </div>
              </div>

              {/* Card 4: <10min */}
              <div className="bg-[#032E47]/40 border border-blue-900/20 rounded-2xl p-5 hover:border-blue-700/30 transition-all duration-300 flex flex-col gap-6 text-center">
                <div>
                  <div className="text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-cyan-400 mb-3 whitespace-nowrap">&lt;10min</div>
                  <p className="text-sm text-blue-100/80 leading-relaxed mb-0">
                    Time for EduValidate to generate your full compliance report
                  </p>
                </div>
                <div className="text-xs text-blue-100/40 uppercase tracking-wider font-semibold">
                  EDUVALIDATE PLATFORM
                </div>
              </div>
            </div>

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

          .price-card {
            animation: price-pop 0.6s ease-out forwards;
            opacity: 0;
          }
          .price-card:nth-child(1) { animation-delay: 0.1s; }
          .price-card:nth-child(2) { animation-delay: 0.2s; }
          .price-card:nth-child(3) { animation-delay: 0.3s; }

          .popular-card {
            animation: price-pop 0.6s 0.2s ease-out forwards;
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
              One annual membership.<br />
              <span className="text-[#021B30]">Unlimited Confidence</span>
            </h2>
            <p className="text-xl text-gray-700 font-semibold max-w-3xl mx-auto">
              Each unit of competency = 1 validation credit
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Lite",
                units: "15 credits",
                price: "$8,000.00",
                popular: false
              },
              {
                name: "Pro",
                units: "40 credits",
                price: "$15,000.00",
                popular: true
              },
              {
                name: "Premium",
                units: "75 credits",
                price: "$22,000.00",
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
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`relative rounded-3xl p-10 transition-all duration-300 h-full flex flex-col justify-between ${
                  plan.popular
                    ? 'bg-gradient-to-br from-[#021B30] to-[#032E47] text-white shadow-2xl shadow-blue-400/50 md:scale-105 md:-mt-6 z-30'
                    : 'bg-white border-2 border-[#021B30]/20 hover:border-[#021B30] group-hover:shadow-2xl group-hover:shadow-blue-200/50'
                }`}>
                  <div>
                    <h3 className={`text-3xl font-black mb-3 ${plan.popular ? 'text-white' : 'text-[#021B30]'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm font-semibold mb-8 ${plan.popular ? 'text-white/80' : 'text-gray-600'}`}>
                      {plan.units}
                    </p>

                    <div className="mb-10">
                      <span className={`text-4xl lg:text-[2.5rem] font-black ${plan.popular ? 'text-white' : 'text-[#021B30]'}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm font-semibold ${plan.popular ? 'text-white/70' : 'text-gray-600'}`}>
                        /year
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/signup')}
                    className="w-full px-6 py-4 bg-[#00cfa7] hover:bg-[#00bda0] rounded-full text-white font-bold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-400/40 mt-6"
                  >
                    Get started
                  </button>
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

      {/* Privacy and Data Security Section */}
      <section className="py-24 bg-gradient-to-b from-white via-cyan-50/20 to-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl opacity-10"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-teal-100/20 to-cyan-100/20 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Column: Info */}
            <div className="lg:col-span-5 text-left flex flex-col justify-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-600 text-xs font-black uppercase tracking-wider mb-6 w-fit">
                PRIVACY AND DATA SECURITY
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#021B30] mb-6 leading-tight">
                Your data stays yours. And stays in Australia.
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                RTOs upload sensitive institutional documents. We've built EduValidate's data practices around the Privacy Act, the 2025 Standards record-keeping requirements, and the AI guardrail on information security.
              </p>
            </div>

            {/* Right Column: 3 Glassmorphic Cards */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Australian data sovereignty */}
              <div className="bg-white/60 backdrop-blur-md border border-[#021B30]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#021B30]/30 transition-all duration-300 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0 text-[#021B30] font-black text-sm">
                  AU
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Australian data sovereignty</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    All uploaded documents and reports are stored on Australian-based servers only. Your data never leaves Australia.
                  </p>
                </div>
              </div>

              {/* Card 2: Not used to train AI models */}
              <div className="bg-white/60 backdrop-blur-md border border-[#021B30]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#021B30]/30 transition-all duration-300 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0 text-cyan-600">
                  <Lock className="w-6 h-6 text-[#021B30]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Not used to train AI models</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Your uploaded assessment tools are never used to train our AI model. Your intellectual property stays yours, always.
                  </p>
                </div>
              </div>

              {/* Card 3: Right to deletion */}
              <div className="bg-white/60 backdrop-blur-md border border-[#021B30]/10 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#021B30]/30 transition-all duration-300 flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0 text-cyan-600">
                  <Trash className="w-6 h-6 text-[#021B30]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Right to deletion</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Cancel at any time. All your data is deleted within 30 days of cancellation on request.
                  </p>
                </div>
              </div>
            </div>
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
          <div className="inline-flex items-center bg-cyan-950/40 backdrop-blur-md border border-cyan-500/30 rounded-full px-6 py-3 mb-10 text-cyan-400 font-bold uppercase tracking-wider text-sm">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
            GET STARTED TODAY
          </div>

          <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 leading-tight">
            Reduce compliance risk through<br className="hidden md:inline" /> structured quality assurance
          </h2>

          <p className="text-lg lg:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed">
            Try EduValidate free with one complete validation — no credit card, no commitment. See exactly what your assessors will see before your auditor does.
          </p>

          <div className="flex justify-center">
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-10 py-4 bg-[#00cfa7] hover:bg-[#00bda0] rounded-full text-white font-bold text-base transition-all duration-300 transform hover:scale-110 flex items-center gap-2 hover:shadow-xl hover:shadow-emerald-400/40"
            >
              Try a free validation ↗
            </button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#021B30] text-gray-400 py-16 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            {/* Logo */}
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="text-[#00cfa7] text-2xl">•</span>
              EduValidate
            </div>
            {/* Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-semibold text-gray-400">
              <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/ai-transparency" className="hover:text-white transition-colors">AI Transparency Statement</Link>
              <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div className="text-sm text-gray-500 mb-8 text-center md:text-left">
            © 2026 EduValidate Pty Ltd
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-8"></div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 leading-relaxed text-center md:text-left">
            EduValidate uses artificial intelligence to support assessment validation. EduValidate does not make compliance determinations — final validation judgements remain the responsibility of your RTO's credentialled trainers and assessors, in accordance with the Standards for RTOs 2025. View our <Link to="/ai-transparency" className="underline hover:text-white transition-colors">AI Transparency Statement</Link> and <Link to="/privacy-policy" className="underline hover:text-white transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </footer>

      {/* Request Demo Modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-[#021B30]/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDemoModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 scale-100 animate-in fade-in-50 zoom-in-95 z-10 text-left">
            <div className="bg-[#021B30] p-6 text-center relative">
              <h3 className="text-2xl font-bold text-white mb-2">Request a Free Demo</h3>
              <p className="text-blue-200 text-sm">Experience EduValidate's audit-grade validation</p>
              <button 
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                className="absolute top-4 right-4 text-white/75 hover:text-white transition-colors text-xl font-bold font-sans"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleDemoSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00cfa7] focus:bg-white text-gray-900 transition-all font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Work Email</label>
                <input 
                  type="email" 
                  required 
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00cfa7] focus:bg-white text-gray-900 transition-all font-medium"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">RTO Name (Registered Training Organisation)</label>
                <input 
                  type="text" 
                  required 
                  value={demoRto}
                  onChange={(e) => setDemoRto(e.target.value)}
                  placeholder="e.g. Eduvalidate RTO"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00cfa7] focus:bg-white text-gray-900 transition-all font-medium"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingDemo}
                className="w-full py-4 bg-gradient-to-r from-[#021B30] to-[#032E47] text-white rounded-xl font-black text-lg hover:shadow-xl hover:shadow-blue-400/30 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingDemo ? "Submitting..." : "Submit Demo Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
