"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  FlaskConical,
  Globe2,
  Lock,
  Power,
  RefreshCw,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  BookOpen,
  ShieldAlert,
  Lightbulb,
  Play,
  Calendar,
  Search,
  Flame,
  UserCheck,
  Sparkles,
  Crown,
  Laptop,
  Eye,
  Server,
  Code,
  Database,
  Cpu,
  Layers,
} from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const navItems = [
  { label: "Product", href: "#features", dropdown: true },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#testimonials", dropdown: true },
  { label: "About", href: "#about" },
];

const trustMetrics = [
  { value: "10,000+", label: "Active Traders", icon: ShieldCheck },
  { value: "4.9 / 5", label: "Average Rating", icon: Star },
  { value: "2M+", label: "Trades Analyzed", icon: TrendingUp },
  { value: "Bank-Level", label: "Security", icon: Lock },
  { value: "150+", label: "Countries", icon: Users },
];

const features = [
  {
    title: "Advanced Analytics",
    description: "Powerful dashboards and performance insights that reveal what works.",
    icon: Target,
  },
  {
    title: "AI Coaching",
    description: "Personalized feedback and actionable recommendations to level up your trading.",
    icon: Bot,
  },
  {
    title: "Smart Journaling",
    description: "Effortless trade logging with automatic tagging, screenshots and notes.",
    icon: CalendarDays,
  },
  {
    title: "Edge Finder",
    description: "Discover high-probability setups and refine your trading edge.",
    icon: BarChart3,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    description: "Perfect for getting started.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "10 AI text prompts per day",
      "Basic journal entries",
      "Core analytics",
    ],
    highlight: false,
    icon: Sparkles,
    iconColor: "text-violet-400",
  },
  {
    name: "Pro",
    description: "For active traders who want more.",
    priceMonthly: 19,
    priceYearly: 15,
    features: [
      "Unlimited trades",
      "MT4/MT5 account sync",
      "Full analytics and charts",
      "AI coaching and reports",
      "Priority support",
    ],
    highlight: true,
    popular: true,
    icon: Star,
    iconColor: "text-cyan-400",
  },
  {
    name: "Elite",
    description: "For traders who want the best.",
    priceMonthly: 49,
    priceYearly: 39,
    features: [
      "Everything in Pro",
      "Multiple accounts",
      "Advanced risk tools",
      "Dedicated support",
      "Early access to new features",
    ],
    highlight: false,
    icon: Crown,
    iconColor: "text-amber-400",
  },
];

const trustBadges = [
  {
    title: "14-Day Free Trial",
    description: "No credit card required",
    icon: Trophy,
  },
  {
    title: "Cancel Anytime",
    description: "No lock-in. Cancel anytime.",
    icon: RefreshCw,
  },
  {
    title: "Bank-Level Security",
    description: "Your data is safe with us",
    icon: Lock,
  },
  {
    title: "24/7 Support",
    description: "We're here to help you.",
    icon: UserCheck,
  },
];

const faqs = [
  {
    q: "Can I upgrade or downgrade my plan anytime?",
    a: "Yes! You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings page. If you upgrade, the changes will take effect immediately. If you downgrade or cancel, your access will continue until the end of your current billing cycle.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We prioritize your privacy and data security above everything else. All connections are encrypted via SSL, and we store your data in secure cloud databases. We never share or sell your trading logs or personal data with anyone.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes, we offer a 14-day free trial on our Pro plan. No credit card is required to sign up for the free trial. You can test out all the features and see if it's the right fit for your trading style.",
  },
];

const resourceCards = [
  {
    title: "Beginner's Guide to Trading Journals",
    description: "Learn why journaling is essential and how to get started the right way.",
    articles: "12 Articles",
    badge: "Beginner",
    badgeStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    icon: BookOpen,
    iconColor: "text-violet-400 border-violet-500/20 bg-violet-500/5",
  },
  {
    title: "Trading Psychology & Mindset",
    description: "Master your mindset and build habits that lead to consistent performance.",
    articles: "15 Articles",
    badge: "Intermediate",
    badgeStyle: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    icon: Target,
    iconColor: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
  },
  {
    title: "Risk Management Strategies",
    description: "Protect your capital and learn proven risk management techniques.",
    articles: "10 Articles",
    badge: "Advanced",
    badgeStyle: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    icon: ShieldAlert,
    iconColor: "text-rose-400 border-rose-500/20 bg-rose-500/5",
  },
  {
    title: "Market Analysis Fundamentals",
    description: "Understand technical and fundamental analysis in simple steps.",
    articles: "18 Articles",
    badge: "Beginner",
    badgeStyle: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    icon: Lightbulb,
    iconColor: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials to make the most of JournalFX.",
    articles: "24 Videos",
    badge: "All Levels",
    badgeStyle: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    icon: Play,
    iconColor: "text-violet-400 border-violet-500/20 bg-violet-500/5",
  },
  {
    title: "Live Webinars",
    description: "Join live sessions with expert traders and ask your questions.",
    articles: "Upcoming Events",
    badge: "Live",
    badgeStyle: "bg-red-500/10 text-red-400 border-red-500/20",
    icon: Calendar,
    iconColor: "text-red-400 border-red-500/20 bg-red-500/5",
  },
];

const popularTopics = [
  { name: "Breakout Trading", icon: "📈" },
  { name: "ICT Concepts", icon: "🧠" },
  { name: "Order Blocks Explained", icon: "📥" },
  { name: "Trading Plan", icon: "📋" },
  { name: "Backtesting Guide", icon: "🧪" },
  { name: "London Session", icon: "🇬🇧" },
];

const resourceTabs = ["All Resources", "Guides", "Trading Tips", "Market Insights", "Video Tutorials", "Webinars"];

const testimonials = [
  {
    name: "Michael T.",
    role: "Full-Time Trader",
    quote:
      "JournalFX completely changed the way I review my trades. My consistency has never been better.",
  },
  {
    name: "Sarah K.",
    role: "Swing Trader",
    quote:
      "The AI coach is like having a mentor in your pocket. It spots things I would normally miss.",
  },
  {
    name: "James R.",
    role: "Forex Trader",
    quote: "Best trading journal I’ve used. The analytics are next level.",
  },
];

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({
    0: true,
  });
  const [activeTab, setActiveTab] = useState("All Resources");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <PublicLayout>
      <section className="relative mx-auto max-w-[1420px] px-5 py-5 lg:px-10">
        <section className="grid items-center gap-10 pb-8 pt-16 lg:grid-cols-[0.82fr_1.18fr] lg:pt-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-teal-300/40 bg-teal-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
              Built for serious traders
            </div>

            <h1 className="max-w-3xl text-[4rem] font-medium leading-[0.95] tracking-[-0.055em] text-white md:text-[5.4rem] xl:text-[6.25rem] [font-family:Georgia,serif]">
              Trade smarter
              <br />
              with{" "}
              <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                JournalFX
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
              The all-in-one trading journal with advanced analytics and AI coaching to help you find an edge and trade with confidence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-violet-600 px-7 py-4 text-sm font-semibold shadow-[0_0_30px_rgba(45,212,191,0.25)] transition hover:opacity-95"
              >
                Start Free Trial
                <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/[0.03] px-7 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/8"
              >
                See How It Works
                <span className="ml-3 flex h-5 w-5 items-center justify-center rounded-full border border-white/20">
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-5 text-sm text-slate-400">
              <span>Syncs with</span>
              {["MetaTrader 4/5", "TradingView", "OANDA", "cTrader", "+ More"].map((item) => (
                <span key={item} className="font-medium text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          >
            <DashboardProductFrame />
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid border-y border-white/10 py-5 md:grid-cols-3 lg:grid-cols-5"
        >
          {trustMetrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`flex items-center justify-center gap-4 px-5 py-4 ${
                index !== trustMetrics.length - 1 ? "lg:border-r lg:border-white/10" : ""
              }`}
            >
              <metric.icon className="h-8 w-8 text-teal-300" />
              <div>
                <p className="text-xl font-semibold text-teal-200">{metric.value}</p>
                <p className="text-xs text-slate-400">{metric.label}</p>
              </div>
            </div>
          ))}
        </motion.section>

        <section id="features" className="py-16 border-b border-white/10 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4 mb-12"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-300">
              Features
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powerful Tools to Improve Your Performance
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full"
              >
                <GlassCard className="p-6 h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-teal-300/25 bg-teal-400/10 text-teal-300">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{feature.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </section>
        <section id="pricing" className="py-16 border-b border-white/10 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-5 max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
              Pricing
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Simple plans for <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">every trader</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Start free and upgrade anytime. Cancel anytime, no hidden fees.
            </p>

            {/* Billing Switch */}
            <div className="flex items-center justify-center pt-4">
              <div className="relative flex rounded-full bg-black/40 p-1 border border-white/5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`relative rounded-full px-6 py-2 text-xs font-semibold transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-white/10 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={`relative rounded-full px-6 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    billingPeriod === "yearly"
                      ? "bg-white/10 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Yearly
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-stretch max-w-5xl mx-auto mb-16"
          >
            {pricingPlans.map((plan) => {
              const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly;
              const isPopular = plan.popular;
              const PlanIcon = plan.icon;

              return (
                <motion.div
                  key={plan.name}
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="h-full flex"
                >
                  <GlassCard
                    className={`relative flex w-full flex-col justify-between p-7 ${
                      plan.highlight
                        ? "border-cyan-300/40 bg-gradient-to-b from-violet-500/12 via-[#0e162f]/95 to-cyan-500/5 shadow-[0_0_50px_rgba(124,58,237,0.25)] ring-1 ring-violet-500/20"
                        : ""
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-8 -translate-y-1/2">
                        <span className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 ${plan.iconColor}`}>
                          <PlanIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-wide">{plan.name}</h3>
                          <p className="text-[10px] text-slate-500 mt-0.5">{plan.description}</p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold tracking-tight text-white">
                          ${price}
                        </span>
                        <span className="text-xs text-slate-400">/month</span>
                      </div>
                      {billingPeriod === "yearly" && price > 0 ? (
                        <p className="text-[10px] text-emerald-400 font-medium mt-1">
                          Billed yearly (${price * 12}/year)
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 mt-1">Billed monthly</p>
                      )}

                      <div className="mt-6 space-y-3">
                        {plan.features.map((feature) => (
                          <div key={feature} className="flex items-start gap-2 text-xs leading-5 text-slate-300">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-400" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className={`mt-6 inline-flex w-full items-center justify-center rounded-xl py-2.5 px-4 text-xs font-semibold transition ${
                        plan.highlight
                          ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95"
                          : "border border-white/15 bg-white/[0.04] hover:bg-white/8 text-slate-200"
                      }`}
                    >
                      Get Started
                    </Link>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto border-y border-white/10 py-6 mb-16 bg-white/[0.01]"
          >
            {trustBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <div key={badge.title} className="flex items-center gap-3 px-4 py-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 shrink-0">
                    <BadgeIcon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{badge.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* FAQ & Promise Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="grid gap-8 lg:grid-cols-[1.3fr_1fr] max-w-5xl mx-auto"
          >
            {/* FAQ Accordion */}
            <div>
              <h2 className="text-xl font-bold text-white mb-5">Frequently asked questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => {
                  const isOpen = faqOpen[index];
                  return (
                    <div
                      key={faq.q}
                      className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.01] transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-slate-200 hover:text-white transition"
                      >
                        <span>{faq.q}</span>
                        <span className="text-slate-400 text-base">{isOpen ? "−" : "+"}</span>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 border-t border-white/5 text-xs leading-6 text-slate-400">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promise Card */}
            <div className="flex items-stretch">
              <div className="w-full rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl" />
                
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 mb-4">
                  <Flame className="h-5.5 w-5.5" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Our promise to you</h3>
                  <p className="text-xs leading-6 text-slate-300">
                    We are committed to helping you become a more consistent and profitable trader with the best tools, insights, and dedicated support. If you aren't completely satisfied, we will do everything we can to make it right.
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-teal-300">
                    JFX
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-white">The JournalFX Team</p>
                    <p className="text-[9px] text-slate-500">Dedicated to your growth</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="resources" className="py-16 border-b border-white/10 scroll-mt-24">
          {/* Top Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center max-w-5xl mx-auto mb-12"
          >
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-300">
                Resources
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.1]">
                Learn, grow, and <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">stay ahead</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Explore our library of guides, tutorials, and market insights designed to help you trade smarter every day.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md pt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none mt-2">
                  <Search className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search guides, strategies, mindsets..."
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400/40 transition"
                />
              </div>
            </div>

            {/* Book Illustration */}
            <div className="flex justify-center relative">
              <div className="absolute -inset-4 rounded-full bg-violet-500/10 blur-2xl" />
              <div className="relative h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] rounded-2xl overflow-hidden border border-white/10 p-1.5 bg-[#0c1222]/80 shadow-[0_0_40px_rgba(139,92,246,0.12)]">
                <Image
                  src="/brand/resources-book.jpg"
                  alt="The Alchemy of Finance Masterclass"
                  width={280}
                  height={280}
                  className="h-full w-full object-cover rounded-xl"
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-5 mb-10 max-w-5xl mx-auto"
          >
            {resourceTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold border transition ${
                  activeTab === tab
                    ? "bg-violet-500 border-violet-400 text-white shadow-lg shadow-violet-500/20"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </motion.div>

          {/* Guide Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto mb-16"
          >
            {resourceCards.map((card) => {
              const CardIcon = card.icon;
              return (
                <div
                  key={card.title}
                  className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition duration-300 hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.iconColor}`}>
                        <CardIcon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${card.badgeStyle}`}>
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white tracking-wide mt-5 leading-snug group-hover:text-teal-300 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[10px] text-slate-500 font-medium">{card.articles}</span>
                    <span className="text-[10px] font-semibold text-violet-300 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Newsletter subscription panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-cyan-300/15 bg-gradient-to-r from-[#080d1c]/95 to-[#16122d]/90 p-6 sm:p-8 shadow-2xl mb-12 max-w-5xl mx-auto relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
            
            <div className="space-y-2 max-w-lg text-center md:text-left z-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Stay updated with expert insights and market trends
              </h2>
              <p className="text-xs text-slate-400">
                Subscribe to our weekly newsletter and never miss valuable trading insights.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full max-w-sm flex flex-col sm:flex-row gap-2.5 z-10">
              {subscribed ? (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 py-3 px-5 rounded-xl text-center text-xs font-semibold">
                  ✓ Thank you for subscribing!
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-3 bg-black/45 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-400/40 transition"
                  />
                  <button
                    type="submit"
                    className="bg-violet-500 hover:bg-violet-600 text-white font-semibold py-3 px-5 rounded-xl text-xs transition shadow-lg shadow-violet-500/15"
                  >
                    Subscribe
                  </button>
                </>
              )}
            </form>
          </motion.div>

          {/* Popular Topics tag pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center space-y-4 pt-2"
          >
            <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              Popular Topics
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTopics.map((topic) => (
                <div
                  key={topic.name}
                  className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.01] px-4 py-2 text-[10px] text-slate-300 hover:border-white/15 transition cursor-pointer"
                >
                  <span>{topic.icon}</span>
                  <span className="font-medium">{topic.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          id="testimonials"
          className="grid gap-5 pb-5 scroll-mt-24 lg:grid-cols-[1fr_1fr_1fr_1.25fr]"
        >
          {testimonials.map((testimonial) => (
            <GlassCard key={testimonial.name} className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-300/40 bg-gradient-to-br from-teal-400 to-violet-600 text-lg font-bold">
                  {testimonial.name[0]}
                </div>
                <p className="text-sm italic leading-6 text-slate-300">“{testimonial.quote}”</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
                <div className="flex text-teal-300">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}

          <GlassCard className="flex items-center gap-6 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
              <Trophy className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Trade. Review. Improve. Repeat.</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Built to help you become your best trader.
              </p>
            </div>
          </GlassCard>
        </motion.section>

        <section id="about" className="relative border-b border-white/10 py-16 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative z-10"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">
                About Us
              </p>
              <h2 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-5xl leading-tight">
                We're on a mission to <br />
                <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                  help traders succeed.
                </span>
              </h2>
              <p className="mt-6 text-sm sm:text-base leading-8 text-slate-300">
                JournalFX was built by traders, for traders. We combine powerful
                technology with real trading experience to create the ultimate
                journal and analytics platform that helps you analyze, improve,
                and grow consistently.
              </p>

              <div className="mt-8 space-y-6">
                <AboutPointNew
                  icon={Power}
                  iconColor="text-violet-400 bg-violet-500/10 border-violet-500/20"
                  title="Built by Traders"
                  text="We understand what traders really need because we live it every day."
                />
                <AboutPointNew
                  icon={ShieldCheck}
                  iconColor="text-teal-400 bg-teal-500/10 border-teal-500/20"
                  title="Trusted Worldwide"
                  text="Join 10,000+ traders from 150+ countries who trust JournalFX."
                />
                <AboutPointNew
                  icon={TrendingUp}
                  iconColor="text-blue-400 bg-blue-500/10 border-blue-500/20"
                  title="Constantly Improving"
                  text="We're always building new features to help you stay ahead."
                />
              </div>
            </motion.div>

            {/* Right Globe + Floating cards column */}
            <div className="lg:col-span-6 relative flex items-center justify-center min-h-[460px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[440px]"
              >
                <GlowingGlobe />
              </motion.div>

              {/* Floating Cards (visible on md and up) */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: -20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute hidden md:block top-[8%] left-[2%] z-20 w-[160px] rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl shadow-xl"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Trades Analyzed</p>
                <p className="mt-1 text-2xl font-bold text-white">2M+</p>
                <div className="mt-3 flex items-end gap-1 h-8">
                  {[20, 40, 60, 30, 80, 50, 90].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-violet-500/70"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20, y: -20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute hidden md:block top-[8%] right-[2%] z-20 w-[160px] rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl shadow-xl"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Active Traders</p>
                <p className="mt-1 text-2xl font-bold text-white">10,000+</p>
                <div className="mt-3 flex -space-x-2 overflow-hidden">
                  {[
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&h=32&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=32&h=32&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=32&h=32&q=80",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=32&h=32&q=80"
                  ].map((url, idx) => (
                    <img
                      key={idx}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-[#02060d] object-cover"
                      src={url}
                      alt="User avatar"
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute hidden md:block bottom-[8%] left-[2%] z-20 w-[160px] rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl shadow-xl"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Countries</p>
                <p className="mt-1 text-2xl font-bold text-white">150+</p>
                <div className="mt-2.5 flex items-center justify-center h-8 text-blue-400">
                  <svg className="w-12 h-8" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M10 20 Q 20 10 30 25 T 50 15 T 70 30 T 90 10 M20 35 Q 35 25 50 40 T 80 30" strokeDasharray="2,2" />
                    <circle cx="30" cy="25" r="2" fill="currentColor" />
                    <circle cx="50" cy="15" r="2" fill="currentColor" />
                    <circle cx="70" cy="30" r="2" fill="currentColor" />
                  </svg>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute hidden md:block bottom-[8%] right-[2%] z-20 w-[160px] rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur-xl shadow-xl"
              >
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Consistency</p>
                <p className="mt-1 text-2xl font-bold text-white">99%</p>
                <div className="mt-3 h-8">
                  <svg className="w-full h-full" viewBox="0 0 100 30" fill="none">
                    <path
                      d="M0 25 Q 15 20 30 10 T 60 18 T 90 2 T 100 5"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Under-Globe Grid cards (visible only on mobile) */}
          <div className="grid grid-cols-2 gap-4 mt-8 md:hidden">
            {[
              { label: "Trades Analyzed", value: "2M+" },
              { label: "Active Traders", value: "10,000+" },
              { label: "Countries", value: "150+" },
              { label: "Consistency", value: "99%" }
            ].map((card, idx) => (
              <div key={idx} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{card.label}</p>
                <p className="mt-1 text-xl font-bold text-white">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Middle Section: Story & Values Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
            {/* Story Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 sm:p-8 flex flex-col justify-between"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7 space-y-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    Our Story
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                    JournalFX started with a simple idea — trading is more than just placing trades. It's about learning, adapting, and becoming 1% better every day.
                  </p>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                    We built the tools we wished we had in our own trading journey, and now we're proud to share them with traders around the world.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 shadow-inner">
                    <img
                      src="/brand/trading_setup_mockup.jpg"
                      alt="JournalFX Workstation Setup"
                      className="w-full h-auto object-cover max-h-[160px] md:max-h-[200px]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Values Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 sm:p-8"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                Our Values
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <ValueBlock
                  icon={Eye}
                  title="Transparency"
                  text="We believe in clear data, honest analytics, and no hidden agendas."
                  tone="text-blue-400 bg-blue-500/10 border-blue-500/20"
                />
                <ValueBlock
                  icon={Users}
                  title="Empowerment"
                  text="We empower traders with the insights and tools to take control."
                  tone="text-violet-400 bg-violet-500/10 border-violet-500/20"
                />
                <ValueBlock
                  icon={Cpu}
                  title="Innovation"
                  text="We push boundaries to bring you features that actually make a difference."
                  tone="text-blue-400 bg-blue-500/10 border-blue-500/20"
                />
                <ValueBlock
                  icon={Star}
                  title="Community"
                  text="We grow together as a community of serious and passionate traders."
                  tone="text-violet-400 bg-violet-500/10 border-violet-500/20"
                />
              </div>
            </motion.div>
          </div>

          {/* Bottom Full-Width Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-white/8 bg-white/[0.02] p-6 sm:p-8 mt-12 grid grid-cols-2 md:grid-cols-5 gap-y-8 gap-x-4 md:gap-0 divide-y-0 divide-x-0 md:divide-x divide-white/8"
          >
            <BottomStatItem icon={Users} value="10,000+" label="Active Traders" />
            <BottomStatItem icon={TrendingUp} value="2M+" label="Trades Analyzed" />
            <BottomStatItem icon={Globe2} value="150+" label="Countries" />
            <BottomStatItem icon={ShieldCheck} value="99%" label="Uptime" />
            <BottomStatItem icon={Star} value="4.9 / 5" label="Average Rating" />
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          id="contact"
          className="pb-7 scroll-mt-24"
        >
          <div className="rounded-3xl border border-cyan-300/20 bg-[radial-gradient(circle_at_left,rgba(20,184,166,0.18),transparent_28%),linear-gradient(90deg,rgba(8,13,28,0.95),rgba(30,20,70,0.85))] p-6 shadow-2xl shadow-black/25 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="hidden h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 md:flex">
                <Image
                  src="/brand/journalfx-logo.png"
                  alt="JournalFX"
                  width={64}
                  height={64}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-2xl font-medium md:text-3xl [font-family:Georgia,serif]">
                  Ready to take your trading to the next level?
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Join thousands of traders who are building consistency with JournalFX.
                </p>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl border border-cyan-300/40 bg-gradient-to-r from-cyan-500 to-violet-600 px-9 py-4 text-sm font-semibold shadow-[0_0_30px_rgba(45,212,191,0.22)] transition hover:opacity-95"
              >
                Start Your Free Trial
                <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-slate-400">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </motion.section>
      </section>
    </PublicLayout>
  );
}

function DashboardProductFrame() {
  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-cyan-500/18 to-violet-600/18 blur-3xl" />
      <div className="relative rotate-[1.5deg] rounded-3xl border border-cyan-300/35 bg-[#07101d]/95 p-3 shadow-[0_0_55px_rgba(20,184,166,0.18),0_0_70px_rgba(124,58,237,0.16)]">
        <div className="grid min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#08101e] lg:grid-cols-[132px_1fr]">
          <aside className="hidden border-r border-white/10 bg-black/20 p-4 lg:block">
            <div className="mb-7 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white p-1">
                <Image
                  src="/brand/journalfx-logo.png"
                  alt="JournalFX"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-semibold text-teal-200">JournalFX</span>
            </div>
            {["Overview", "Trades", "Analytics", "Reports", "AI Coach", "Goals", "Backtesting", "Settings"].map((item, index) => (
              <div
                key={item}
                className={`mb-2 rounded-lg px-3 py-2 text-xs ${
                  index === 0
                    ? "border border-teal-300/40 bg-teal-400/10 text-teal-100"
                    : "text-slate-400"
                }`}
              >
                {item}
              </div>
            ))}
          </aside>

          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Overview</h2>
              <div className="flex gap-2 text-[11px] text-slate-300">
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">May 1 — May 31, 2026</span>
                <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">Filters</span>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_180px_220px]">
              <div className="space-y-4">
                <GlassPanel className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Equity Curve</p>
                      <p className="mt-1 text-2xl font-semibold">$28,645.73</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-300">+12.54%</span>
                  </div>
                  <HeroChart />
                </GlassPanel>
                <GlassPanel className="p-4">
                  <p className="mb-3 text-xs text-slate-400">Performance</p>
                  <div className="grid grid-cols-4 gap-3 text-xs">
                    {[
                      ["Net P&L", "$3,186.45"],
                      ["Win Rate", "63.2%"],
                      ["Profit Factor", "1.82"],
                      ["Expectancy", "$48.67"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-slate-500">{label}</p>
                        <p className="mt-1 font-semibold text-teal-200">{value}</p>
                      </div>
                    ))}
                  </div>
                  <BarPreview />
                </GlassPanel>
              </div>

              <div className="space-y-4">
                <GlassPanel className="p-4 text-center">
                  <p className="text-left text-xs text-slate-400">Risk Score</p>
                  <Donut value="78" label="Good" />
                </GlassPanel>
                <GlassPanel className="p-4 text-center">
                  <p className="text-left text-xs text-slate-400">Drawdown</p>
                  <Donut value="8.71%" label="Max Drawdown" purple />
                  <p className="mt-2 text-sm font-semibold">$2,532.18</p>
                </GlassPanel>
              </div>

              <div className="space-y-4">
                <GlassPanel className="bg-violet-500/14 p-4">
                  <p className="text-sm font-semibold text-violet-100">AI Coach</p>
                  <p className="mt-4 text-xs font-semibold">AI Recommendation</p>
                  <p className="mt-2 text-xs leading-6 text-slate-300">
                    Your performance improves significantly when risking 0.5%–1% per trade. Consider reducing size on news days.
                  </p>
                  <button className="mt-4 w-full rounded-lg border border-cyan-300/40 px-3 py-2 text-xs text-cyan-100">
                    View Details
                  </button>
                </GlassPanel>
                <GlassPanel className="p-4">
                  <p className="mb-3 text-sm font-semibold">Top Setups</p>
                  {["London Breakout", "Trend Continuation", "New York Reversal"].map((setup) => (
                    <div key={setup} className="flex items-center justify-between border-b border-white/8 py-2 text-xs last:border-0">
                      <span className="text-slate-300">{setup}</span>
                      <span className="text-teal-300">+$987</span>
                    </div>
                  ))}
                </GlassPanel>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroChart() {
  return (
    <div className="relative mt-5 h-36 overflow-hidden rounded-xl bg-gradient-to-b from-teal-400/12 to-transparent">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:100%_30px]" />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="tealFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 130 L32 112 L64 118 L96 90 L128 98 L160 70 L192 80 L224 54 L256 62 L288 42 L320 52 L352 36 L384 44 L416 28 L448 36 L480 18 L520 8 L520 160 L0 160 Z" fill="url(#tealFill)" />
        <path d="M0 130 L32 112 L64 118 L96 90 L128 98 L160 70 L192 80 L224 54 L256 62 L288 42 L320 52 L352 36 L384 44 L416 28 L448 36 L480 18 L520 8" fill="none" stroke="#2dd4bf" strokeWidth="3" />
      </svg>
    </div>
  );
}

function Donut({ value, label, purple = false }: { value: string; label: string; purple?: boolean }) {
  return (
    <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-teal-300 via-teal-400 to-slate-800 p-3" style={purple ? { background: "conic-gradient(#8b5cf6 0 70%, #2dd4bf 70% 86%, #1f2937 86%)" } : undefined}>
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#08101e]">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-[10px] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function BarPreview() {
  return (
    <div className="mt-4 flex h-16 items-end gap-2">
      {[26, 48, 20, 58, 36, 70, 24, 55, 42, 74, 32, 64].map((height, index) => (
        <div
          key={index}
          className={`flex-1 rounded-t ${index % 3 === 0 ? "bg-violet-400" : "bg-teal-300"}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function AboutPoint({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-2 text-xs leading-6 text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function ImpactRow({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function GlowingGlobe() {
  const nodes = [
    { left: "19%", top: "38%" },
    { left: "27%", top: "28%" },
    { left: "37%", top: "46%" },
    { left: "46%", top: "24%" },
    { left: "54%", top: "38%" },
    { left: "62%", top: "58%" },
    { left: "72%", top: "34%" },
    { left: "78%", top: "50%" },
    { left: "42%", top: "67%" },
    { left: "30%", top: "58%" },
  ];

  return (
    <div className="relative z-0 mx-auto flex h-[360px] w-full max-w-[520px] items-center justify-center">
      <div className="absolute h-[330px] w-[330px] rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute h-[300px] w-[300px] rounded-full border border-violet-300/25 bg-[radial-gradient(circle_at_35%_35%,rgba(196,181,253,0.42),rgba(124,58,237,0.14)_28%,rgba(2,6,23,0.08)_65%)] shadow-[0_0_70px_rgba(139,92,246,0.35)]">
        <div className="absolute inset-4 rounded-full border border-violet-300/15" />
        <div className="absolute inset-10 rounded-full border border-violet-300/10" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-violet-300/12" />
        <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-violet-300/12" />
        <div className="absolute inset-0 rounded-full bg-[linear-gradient(35deg,transparent_25%,rgba(167,139,250,0.16)_26%,transparent_32%,transparent_55%,rgba(167,139,250,0.13)_57%,transparent_63%)]" />

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 300">
          <path d="M45 150 C80 85, 126 72, 160 96 C190 118, 218 122, 255 92" fill="none" stroke="rgba(167,139,250,0.32)" strokeWidth="1" />
          <path d="M48 195 C86 172, 118 186, 150 154 C181 122, 211 156, 252 138" fill="none" stroke="rgba(167,139,250,0.28)" strokeWidth="1" />
          <path d="M73 77 C116 120, 104 179, 142 226" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
          <path d="M210 58 C178 110, 198 164, 170 238" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="1" />
        </svg>

        {nodes.map((node, index) => (
          <span
            key={index}
            className="absolute h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_18px_rgba(196,181,253,0.9)]"
            style={{ left: node.left, top: node.top }}
          />
        ))}
      </div>

      <div className="absolute h-[360px] w-[360px] rounded-full border border-violet-300/10" />
      <div className="absolute h-[430px] w-[430px] rotate-12 rounded-full border border-violet-300/8" />
      <div className="absolute h-[390px] w-[390px] -rotate-12 rounded-full border border-violet-300/8" />
    </div>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/12 bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/[0.04] ${className}`}>
      {children}
    </div>
  );
}

function AboutPointNew({
  icon: Icon,
  iconColor,
  title,
  text,
}: {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ValueBlock({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  tone: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${tone} w-fit`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function BottomStatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 px-2 py-3 md:py-0 md:px-5 justify-center md:justify-start first:pt-0 md:first:pt-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/8 text-violet-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
