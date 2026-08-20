"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  MousePointer,
  Sparkles,
  BarChart3,
  FileText,
  Rocket,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function HowToUsePage() {
  const steps = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Select an Area",
      description: "Click on the map to add points and create a polygon. You need at least 3 points to define an area.",
      tip: "Click on the map to add points, double-click to finish the polygon."
    },
    {
      icon: <MousePointer className="w-6 h-6" />,
      title: "Analyze Area",
      description: "Click the 'Analyze Area' button to start the satellite data analysis.",
      tip: "The analysis takes a few seconds to process satellite imagery."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Review Results",
      description: "TerraGuard analyzes vegetation (NDVI), temperature, water, and moisture for your area.",
      tip: "Results appear in the sidebar on the left."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Explore Historical Data",
      description: "Check historical NDVI trends and compare current conditions with past years.",
      tip: "Historical data helps detect environmental changes over time."
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Read AI Analysis",
      description: "Gemini AI provides an executive summary, signals, and investigation priorities.",
      tip: "AI analysis is based solely on the satellite data collected."
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Take Action",
      description: "Use the investigation priority to decide where to focus further research or monitoring.",
      tip: "TerraGuard helps you prioritize where humans should investigate first."
    }
  ];

  const features = [
    {
      title: "Free and Open",
      description: "All satellite data comes from public sources. No subscription required."
    },
    {
      title: "No Hardware",
      description: "Analyze any area on Earth without deploying any sensors or equipment."
    },
    {
      title: "Real-Time",
      description: "Get results in seconds with live satellite data processing."
    },
    {
      title: "Actionable",
      description: "Clear risk scores and investigation priorities to guide decision-making."
    }
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
                Getting Started
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              How to Use
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                TerraGuard
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
            >
              Monitor environmental conditions anywhere on Earth in just a few clicks.
              No sensors, no hardware, no setup required.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Simple Steps</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Get environmental intelligence in 6 easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Tip: {step.tip}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Why TerraGuard?</h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need for environmental monitoring in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Select an area on the map and start analyzing.
            </p>
            <a
              href="/tool"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/25"
            >
              Launch Tool
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}