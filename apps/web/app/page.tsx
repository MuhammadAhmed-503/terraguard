"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Satellite, 
  Shield, 
  TrendingUp, 
  Globe, 
  Zap, 
  BarChart3,
  CheckCircle,
  Sparkles,
  MapPin,
  Award
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Satellite className="w-6 h-6" />,
      title: "Satellite-Powered",
      description: "Analyze any location on Earth using Sentinel-2, Landsat, and other satellite data.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk Intelligence",
      description: "Get real-time environmental risk scores with multi-signal analysis.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Historical Trends",
      description: "Compare current conditions with historical baselines to detect changes.",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Gemini AI provides environmental analysis and investigation priorities.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Multi-Signal Analysis",
      description: "Analyze vegetation, temperature, water, and moisture in one dashboard.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Coverage",
      description: "Access environmental data for any location on the planet.",
    }
  ];

  const stats = [
    { value: "10+", label: "Satellite Datasets" },
    { value: "6", label: "Environmental Signals" },
    { value: "100%", label: "Cloud-Based" },
  ];

  const steps = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Select Area",
      description: "Draw a polygon on the map anywhere in the world."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Analyze",
      description: "Get instant environmental data from satellite observations."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Act",
      description: "Review AI-powered insights and investigation priorities."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20 transition-colors">
                🛰️ Satellite-Powered Environmental Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Earth's Environment
              <br />
              {/* <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              
              </span> */}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto transition-colors"
            >
              TerraGuard converts satellite data into actionable environmental intelligence.
              Select any area on Earth and get instant insights about vegetation, temperature,
              water, and risk.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/tool"
                className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
              >
                Launch Tool
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-to-use"
                className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-lg transition-all duration-200"
              >
                How It Works
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-3"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 transition-colors">
                  <p className="text-2xl md:text-3xl font-bold text-emerald-500">{stat.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors">How It Works</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
              Three simple steps to get environmental intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 transition-colors">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white transition-colors">Everything You Need</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
              TerraGuard combines multiple satellite datasets and AI to give you a complete
              picture of environmental conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 md:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl" />
            <h2 className="text-2xl md:text-3xl font-bold text-white relative">
              Ready to Explore Your Environment?
            </h2>
            <p className="mt-4 text-emerald-100 max-w-2xl mx-auto relative">
              Start analyzing any area on Earth instantly. No setup required.
            </p>
            <Link
              href="/tool"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-all duration-200 relative"
            >
              Launch Tool Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}