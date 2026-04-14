import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Sparkles,
  Octahedron,
  Float,
  Torus,
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { projectsData } from "./data";

// --- THE 3D TACTICAL RADAR (FOR THE FOOTER) ---
function TacticalRadar() {
  const pointsRef = useRef();
  const ringRef = useRef();
  const count = 1500;

  // Mathematically plot points using the Golden Ratio for a perfect sphere
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      pos[i * 3] = Math.cos(theta) * radius * 3;
      pos[i * 3 + 1] = y * 3;
      pos[i * 3 + 2] = Math.sin(theta) * radius * 3;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate the point sphere
    pointsRef.current.rotation.y = time * 0.15;

    // Rotate the outer wireframe rings
    ringRef.current.rotation.x = time * 0.2;
    ringRef.current.rotation.y = time * 0.1;

    // Mouse tracking for parallax
    const targetX = state.pointer.x * 0.3;
    const targetY = state.pointer.y * 0.3;

    pointsRef.current.rotation.x +=
      0.05 * (targetY - pointsRef.current.rotation.x);
    pointsRef.current.rotation.z +=
      0.05 * (targetX - pointsRef.current.rotation.z);
  });

  return (
    <group>
      {/* The Core Point Sphere */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#dc2626"
          transparent
          opacity={0.6}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* The Gyroscopic Wireframe Rings */}
      <group ref={ringRef}>
        <Torus args={[3.5, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial
            color="#ef4444"
            wireframe
            transparent
            opacity={0.2}
          />
        </Torus>
        <Torus args={[4, 0.02, 16, 100]} rotation={[0, Math.PI / 4, 0]}>
          <meshBasicMaterial
            color="#ffffff"
            wireframe
            transparent
            opacity={0.1}
          />
        </Torus>
      </group>
    </group>
  );
}

export default function App() {
  const aboutRef = useRef(null);
  const projectsRef = useRef(null);
  const contactRef = useRef(null);

  const slashEase = [0.85, 0, 0.15, 1];

  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- UPGRADED HIGH-VISIBILITY CURSOR ---
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (e) =>
      setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, []);

  return (
    <div className="relative w-full bg-black text-slate-300 overflow-x-hidden font-sans selection:bg-red-600 selection:text-white cursor-none">
      {/* --- LETHAL HIGH-VISIBILITY CURSOR --- */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-[1.5px] border-red-500 pointer-events-none z-[999] flex justify-center items-center hidden md:flex mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          rotate: 360,
        }}
        transition={{
          x: { type: "spring", stiffness: 800, damping: 25, mass: 0.1 },
          y: { type: "spring", stiffness: 800, damping: 25, mass: 0.1 },
          rotate: { duration: 4, repeat: Infinity, ease: "linear" },
        }}
      >
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_#dc2626]" />
      </motion.div>

      {/* --- STEALTH NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-6 pointer-events-none mix-blend-difference">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: slashEase }}
          className="text-red-600 font-black tracking-[0.3em] uppercase text-xs border-l-2 border-red-600 pl-3"
        >
          Ronin.Dev
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: slashEase, delay: 0.2 }}
          className="flex gap-8 pointer-events-auto"
        >
          {["About", "Projects", "Contact"].map((item) => (
            <button
              key={item}
              onClick={() =>
                scrollToSection(
                  item === "About"
                    ? aboutRef
                    : item === "Projects"
                      ? projectsRef
                      : contactRef,
                )
              }
              className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors duration-300 relative group"
            >
              {item}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
            </button>
          ))}
        </motion.div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-screen flex flex-col justify-center px-10 md:px-32">
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 8] }}>
            <ambientLight intensity={0.1} />
            <directionalLight
              position={[5, 5, 5]}
              intensity={2}
              color="#dc2626"
            />
            <directionalLight
              position={[-5, -5, -5]}
              intensity={1}
              color="#ffffff"
            />

            <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
              <Octahedron
                args={[1, 0]}
                scale={[0.8, 3, 0.8]}
                position={[3, 0, -2]}
              >
                <meshStandardMaterial
                  color="#111111"
                  metalness={0.9}
                  roughness={0.2}
                />
              </Octahedron>
              <Octahedron
                args={[1.1, 0]}
                scale={[0.85, 3.1, 0.85]}
                position={[3, 0, -2]}
              >
                <meshBasicMaterial
                  color="#dc2626"
                  wireframe
                  transparent
                  opacity={0.1}
                />
              </Octahedron>
            </Float>

            <Sparkles
              count={300}
              scale={12}
              size={3}
              speed={0.5}
              opacity={0.6}
              color="#dc2626"
            />
            <Sparkles
              count={100}
              scale={15}
              size={2}
              speed={1}
              opacity={0.3}
              color="#475569"
            />

            <OrbitControls
              enableZoom={false}
              autoRotate
              autoRotateSpeed={0.3}
            />
          </Canvas>
        </div>

        <div className="relative z-10 pointer-events-none max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.6, ease: slashEase }}
            className="w-12 h-1 bg-red-600 mb-8 origin-left"
          />

          <motion.div className="overflow-hidden mb-2">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: slashEase, delay: 0.2 }}
              className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase"
            >
              Gaurav
            </motion.h1>
          </motion.div>

          <motion.div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, ease: slashEase, delay: 0.3 }}
              className="text-6xl md:text-8xl font-black tracking-tighter text-transparent"
              style={{ WebkitTextStroke: "1px white" }}
            >
              Chandelkar
            </motion.h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: slashEase, delay: 0.5 }}
            className="text-lg md:text-xl font-mono tracking-[0.2em] text-red-500 uppercase mb-12"
          >
            System Architect <span className="text-slate-700 mx-2">||</span> AI
            Specialist
          </motion.h2>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            onClick={() => scrollToSection(aboutRef)}
            whileHover={{
              scale: 1.05,
              backgroundColor: "#dc2626",
              color: "#ffffff",
              borderColor: "#dc2626",
            }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-transparent border border-slate-600 text-white font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 pointer-events-auto flex items-center gap-4 group"
          >
            Unsheathe Data
            <span className="w-8 h-[1px] bg-white group-hover:bg-white transition-all"></span>
          </motion.button>
        </div>
      </div>

      {/* --- ABOUT SECTION --- */}
      <div
        ref={aboutRef}
        className="relative z-10 w-full min-h-screen flex justify-center items-center py-32 px-10 md:px-32 bg-[#050505] border-t border-slate-900"
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: slashEase }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-16 items-start"
        >
          <div className="md:col-span-4 flex flex-col gap-8">
            <div className="p-8 border-l-2 border-red-600 bg-gradient-to-r from-red-900/10 to-transparent">
              <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">
                #1
              </h3>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                Institute Topper
              </p>
              <p className="text-slate-400 text-sm mt-4">
                Ranked first across the entire institute for Computer
                Engineering.
              </p>
            </div>
            <div className="p-8 border-l-2 border-slate-700 bg-gradient-to-r from-slate-900/50 to-transparent">
              <h3 className="text-5xl font-black text-white mb-2 tracking-tighter">
                20+
              </h3>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">
                Minds Mentored
              </p>
              <p className="text-slate-400 text-sm mt-4">
                Guided peers through complex DSA and Advanced Java logic.
              </p>
            </div>
          </div>

          <div className="md:col-span-8 md:pl-10">
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white uppercase">
              Precision in <span className="text-red-600">Execution.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-6 leading-relaxed">
              As a Computer Engineering student at NIT Polytechnic, Nagpur, I
              don't just write code; I assassinate bugs and architect lethal,
              high-performance systems. My discipline lies in transforming
              chaotic data into sharp, seamless user interfaces.
            </p>
            <p className="text-lg text-slate-500 mb-12 leading-relaxed">
              Off the battlefield, I study the tactical narratives of Anime &
              K-Dramas, master the Korean language, and strategize alongside my
              cat, Mello.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                "Java (Expert)",
                "Python",
                "React.js",
                "Tailwind",
                "Node.js",
                "Firebase",
              ].map((skill, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-[#0a0a0a] border border-slate-800 text-slate-300 text-xs font-mono uppercase tracking-widest hover:border-red-600 hover:text-red-500 transition-colors cursor-default"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- PROJECTS SECTION --- */}
      <div
        ref={projectsRef}
        className="relative z-10 w-full min-h-screen flex flex-col items-center py-32 px-10 md:px-32 bg-black border-t border-slate-900"
      >
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-end mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: "4rem" }}
              transition={{ duration: 0.8, ease: slashEase }}
              viewport={{ once: true }}
              className="h-1 bg-red-600 mb-6"
            />
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: slashEase, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter"
            >
              The Arsenal
            </motion.h2>
          </div>
          <p className="text-slate-600 font-mono text-xs tracking-[0.2em] uppercase hidden md:block">
            Select Weaponry
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          {projectsData.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.6,
                ease: slashEase,
                delay: index * 0.1,
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <Tilt
                glareEnable={true}
                glareMaxOpacity={0.1}
                glareColor="#dc2626"
                glarePosition="all"
                tiltMaxAngleX={2}
                tiltMaxAngleY={2}
                transitionSpeed={3000}
                className="h-full"
              >
                <div className="h-full flex flex-col justify-between bg-[#050505] border border-slate-800 hover:border-red-600/50 p-10 transition-colors duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-900/5 to-transparent skew-x-12 translate-x-10 group-hover:-translate-x-full transition-transform duration-1000 ease-out" />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase group-hover:text-red-500 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-10">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {project.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-black border border-slate-700 text-slate-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- THE UPGRADED CONTACT SECTION (TACTICAL RADAR) --- */}
      <div
        ref={contactRef}
        className="relative z-10 w-full min-h-screen flex justify-center items-center bg-[#050505] border-t border-slate-900 overflow-hidden"
      >
        {/* 3D Tactical Radar Background */}
        <div className="absolute inset-0 z-0 pointer-events-auto opacity-80">
          <Canvas camera={{ position: [0, 0, 7] }}>
            <TacticalRadar />
          </Canvas>
        </div>

        {/* Tactical Command UI Layered on Top */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: slashEase }}
          viewport={{ once: true }}
          className="relative z-10 flex flex-col items-center p-10 md:p-16 bg-black/60 border border-red-900/30 backdrop-blur-md w-full max-w-4xl mx-6 pointer-events-none shadow-[0_0_50px_rgba(220,38,38,0.1)]"
        >
          <div className="w-1 h-12 bg-red-600 mb-8" />

          <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase text-center">
            Make Contact.
          </h2>
          <p className="text-slate-400 mb-12 text-sm font-mono tracking-wide uppercase text-center max-w-lg">
            Awaiting coordinates for collaborative strikes, AI integration, or
            tactical K-Drama reviews.
          </p>

          {/* Secure Terminal UI Block */}
          <div className="w-full bg-[#0a0a0a] border border-slate-800 p-4 mb-12 flex items-center justify-between pointer-events-auto group hover:border-red-900/50 transition-colors">
            <div className="flex items-center gap-4 px-4">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-sm animate-pulse shadow-[0_0_8px_#dc2626]"></div>
              <span className="text-slate-500 font-mono text-xs tracking-widest">
                STATUS:{" "}
                <span className="text-red-500 font-bold">
                  AWAITING TRANSMISSION
                </span>
              </span>
            </div>
            <a
              href="mailto:your.email@example.com"
              className="px-6 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 font-bold text-[10px] tracking-[0.2em] uppercase transition-all duration-300"
            >
              Initiate Link
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pointer-events-auto">
            {["GitHub", "LinkedIn"].map((btn) => (
              <motion.a
                key={btn}
                href="#"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "#dc2626",
                  borderColor: "#dc2626",
                  color: "#ffffff",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-transparent border border-slate-700 text-slate-300 font-bold tracking-[0.2em] text-xs uppercase transition-all duration-300"
              >
                {btn}
              </motion.a>
            ))}
          </div>
        </motion.div>

        <div className="absolute bottom-6 w-full text-center z-10 pointer-events-none">
          <p className="text-slate-700 text-[10px] font-black tracking-[0.3em] uppercase">
            Sector: Nagpur, MH // Engine: React + Three.js
          </p>
        </div>
      </div>
    </div>
  );
}
