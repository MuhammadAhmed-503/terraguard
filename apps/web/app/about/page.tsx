"use client";

import { motion } from "framer-motion";
import {
  Satellite,
  Shield,
  TrendingUp,
  Globe,
  Zap,
  BarChart3,
  Users,
  Sparkles,
  Target,
  Rocket
} from "lucide-react";

export default function AboutPage() {
  const teamValues = [
    {
      icon: <Satellite className="w-6 h-6" />,
      title: "Satellite-Powered",
      description: "We leverage publicly available satellite data from Sentinel, Landsat, and other Earth observation missions."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Transparent Intelligence",
      description: "Our risk engine is explainable and open. No black boxes, no hidden algorithms."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Accessibility",
      description: "Analyze any location on Earth. No sensors, no hardware, no field deployment required."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Gemini AI provides environmental analysis and investigation priorities based on real data."
    }
  ];

  const stats = [
    { value: "10+", label: "Satellite Datasets" },
    { value: "6", label: "Environmental Signals" },
    { value: "100%", label: "Cloud-Based" },
    { value: "0", label: "Sensors Required" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                About TerraGuard
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Environmental Intelligence
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                Without Hardware
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
            >
              TerraGuard is a satellite-powered environmental early-warning platform that converts
              planetary-scale Earth observation data into actionable environmental intelligence.
              No sensors. No hardware. Just data.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-500">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              To make environmental intelligence accessible to everyone. We believe that
              understanding our planet's health should not require expensive sensors or
              specialized equipment.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Target className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Monitor</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Any area on Earth using satellite data
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Rocket className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Analyze</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Environmental conditions and changes over time
                </p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Users className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white">Empower</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Decision-makers with actionable intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">What We Believe</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our core principles guide everything we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Built With</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Modern technologies powering the TerraGuard platform.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              "Next.js", "React", "TypeScript", "Tailwind CSS", "FastAPI", "Python"
            ].map((tech, index) => (
              <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{tech}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              "Google Earth Engine", "Sentinel-2", "Landsat", "Gemini AI"
            ].map((tech, index) => (
              <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <h2 className="text-2xl md:text-3xl font-bold text-white relative">
              Ready to Monitor Your Environment?
            </h2>
            <p className="mt-4 text-emerald-100 max-w-2xl mx-auto relative">
              Start analyzing any area on Earth instantly. No sensors required.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <a
                href="/tool"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-all duration-200"
              >
                Launch Tool
              </a>
              <a
                href="/how-to-use"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-700/50 text-white font-medium rounded-lg hover:bg-emerald-700/70 transition-all duration-200 backdrop-blur-sm"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}