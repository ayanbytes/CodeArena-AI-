import { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Environment, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Cpu, ShieldCheck, Zap } from 'lucide-react';

function generateSpherePoints(numPoints: number, radius: number) {
  const points = new Float32Array(numPoints * 3);
  for (let i = 0; i < numPoints; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

function ParticleBackground(props: any) {
  const ref = useRef<any>(null);
  const sphere = useMemo(() => generateSpherePoints(1666, 10), []);
  
  useFrame((_state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });
  
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial transparent color="#aa3bff" size={0.05} sizeAttenuation={true} depthWrite={false} />
      </Points>
    </group>
  );
}

function FloatingCubes() {
  const ref = useRef<any>(null);
  useFrame((state) => {
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
    ref.current.rotation.y = Math.cos(state.clock.elapsedTime) * 0.2;
  });

  return (
    <group ref={ref}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-3, 1, -2]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#c084fc" wireframe />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[3, -1, -3]}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#aa3bff" wireframe />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[0, -2, -1]}>
          <octahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#ffffff" wireframe opacity={0.5} transparent />
        </mesh>
      </Float>
    </group>
  );
}

export function Landing() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans overflow-x-hidden selection:bg-primary/30">
      
      {/* 3D Canvas Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Canvas camera={{ position: [0, 0, 8] }}>
          <Environment preset="city" />
          <ParticleBackground />
          <FloatingCubes />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
        </Canvas>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md border-b border-white/5 bg-background/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">CodeArena AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          <Link to="/login" className="text-sm font-medium px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(170,59,255,0.4)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-screen text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-8">
            <SparklesIcon className="w-4 h-4" /> Next-Generation Assessment Platform
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-tight">
            Evaluate Talent with <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-blue-400">
              AI Precision.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto font-light">
            A premium, AI-driven coding platform designed for technical interviews and intern evaluations. Faster, smarter, and visually stunning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="px-8 py-4 rounded-full bg-foreground text-background font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-xl">
              Start Evaluating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-card border border-border font-semibold hover:bg-muted transition-colors flex items-center gap-2">
              View Demo
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-32 px-8 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Engineered for Excellence</h2>
            <p className="text-muted-foreground text-lg">Everything you need to assess coding skills accurately.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Lightning Fast Execution"
              description="Powered by Judge0, code runs in secure sandboxes with millisecond latency."
            />
            <FeatureCard 
              icon={<Cpu className="w-8 h-8 text-primary" />}
              title="AI-Powered Feedback"
              description="Gemini evaluates time complexity, code quality, and provides actionable improvement suggestions."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
              title="Advanced Anti-Cheating"
              description="Built-in tab tracking, copy-paste detection, and session monitoring."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-8 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code2 className="w-5 h-5" /> CodeArena AI &copy; 2026
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-card border border-border hover:border-primary/50 transition-colors group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 border border-border">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
