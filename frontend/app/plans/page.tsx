"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Check, Crown, ShieldCheck, HelpCircle, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/components/auth/UserContext";
import { createCheckoutSession, createPortalSession } from "@/services/api/stripe";

function PlansContent() {
  const { user } = useCurrentUser();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlanRaw = user?.plan || "Free";
  const currentPlan = currentPlanRaw.trim().charAt(0).toUpperCase() + currentPlanRaw.trim().slice(1).toLowerCase();

  const isElite = currentPlan === "Elite";
  const isPro = currentPlan === "Pro";
  const isFree = currentPlan === "Free";

  const getPlanConfig = (planName: string) => {
    if (planName === "Free") {
      if (isFree) {
        return {
          label: "Current Plan",
          style: "border border-white/10 bg-white/5 text-slate-300 cursor-default opacity-80 font-medium",
          disabled: true,
        };
      }
      return {
        label: isElite ? "Included in Elite" : "Included in Pro",
        style: "border border-white/5 bg-white/[0.02] text-slate-500 cursor-not-allowed opacity-50",
        disabled: true,
      };
    }

    if (planName === "Pro") {
      if (isPro) {
        return {
          label: "Current Plan",
          style: "border border-violet-500/40 bg-violet-500/20 text-violet-300 font-bold cursor-default shadow-lg shadow-violet-500/20 ring-1 ring-violet-500/30",
          disabled: true,
        };
      }
      if (isElite) {
        return {
          label: "Included in Elite",
          style: "border border-violet-500/10 bg-violet-600/5 text-slate-500 cursor-not-allowed opacity-50",
          disabled: true,
        };
      }
      return {
        label: "Upgrade to Pro",
        style: "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:opacity-95",
        disabled: false,
      };
    }

    if (planName === "Elite") {
      if (isElite) {
        return {
          label: "Current Plan",
          style: "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold cursor-default shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30",
          disabled: true,
        };
      }
      return {
        label: "Upgrade to Elite",
        style: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:opacity-95",
        disabled: false,
      };
    }

    return {
      label: "Select Plan",
      style: "bg-white/10 text-white",
      disabled: false,
    };
  };

  const plans = [
    {
      name: "Free",
      priceMonthly: 0,
      priceYearly: 0,
      totalYearly: 0,
      description: "Best for testing the journal and basic coaching.",
      features: [
        "Trading journal",
        "Dashboard analytics",
        "AI Coach 10 text requests/day",
        "Basic funded tracking",
      ],
      accent: "border-white/8 bg-white/[0.03]",
    },
    {
      name: "Pro",
      priceMonthly: 15,
      priceYearly: 10,
      totalYearly: 120,
      description: "For serious traders who want deeper insights.",
      features: [
        "Unlimited AI coaching",
        "Advanced performance insights",
        "Priority feature access",
        "MT5/MT4 integration tools",
      ],
      accent: "border-violet-400/20 bg-gradient-to-br from-violet-500/15 via-[#0e162f]/80 to-cyan-500/10 scale-105 ring-1 ring-violet-500/30",
      popular: true,
    },
    {
      name: "Elite",
      priceMonthly: 35,
      priceYearly: 30,
      totalYearly: 360,
      description: "For funded traders and power users.",
      features: [
        "Everything in Pro",
        "Team / account management",
        "Premium coaching",
        "White-glove support",
        "TradingView Backtesting Chat",
      ],
      accent: "border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 via-[#0b1322]/80 to-cyan-500/10",
    },
  ];

  const handlePlanAction = async (planName: string, isDisabled: boolean) => {
    if (isDisabled) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to choose a subscription plan.");
      return;
    }

    try {
      setLoadingPlan(planName);

      // If user is already on a paid plan (Pro/Elite) and wants to switch/manage, send them to portal
      if (currentPlan !== "Free" && planName !== "Elite" && currentPlan !== planName) {
        const response = await createPortalSession(token);
        if (response.url) {
          window.location.href = response.url;
        }
        return;
      }

      // Create new checkout session for Pro or Elite
      const response = await createCheckoutSession(token, planName);
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Payment session creation failed:", error);
      alert("Failed to initialize secure checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <Badge className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1 text-xs">
          Pricing Plans
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Choose the Right Plan for You
        </h1>
        <p className="max-w-2xl mx-auto text-base text-slate-400 leading-relaxed">
          Upgrade your trading journal with advanced analytics, real-time MT5 cloud synchronization, and personalized AI coaching.
        </p>

        {/* Toggle Switch */}
        <div className="flex items-center justify-center pt-4">
          <div className="relative flex rounded-full bg-black/40 p-1 border border-white/5 shadow-inner">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`relative rounded-full px-5 py-2 text-xs font-semibold transition-all ${
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
              className={`relative rounded-full px-5 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billingPeriod === "yearly"
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                Save 33%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 pt-6 items-stretch">
        {plans.map((plan) => {
          const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceYearly;
          const isPopular = plan.popular;
          const isProcessing = loadingPlan === plan.name;
          const btnConfig = getPlanConfig(plan.name);

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col justify-between rounded-3xl border p-7 shadow-xl shadow-black/20 transition duration-300 hover:translate-y-[-4px] ${plan.accent}`}
            >
              {isPopular && (
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <Badge className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-none py-1 px-3.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg shadow-indigo-500/20">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  {plan.name === "Pro" ? (
                    <Crown className="h-5 w-5 text-violet-300" />
                  ) : plan.name === "Elite" ? (
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-slate-400" />
                  )}
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {plan.name}
                  </h3>
                </div>

                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white">
                    ${price}
                  </span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>

                {billingPeriod === "yearly" && price > 0 && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                    Billed yearly (${plan.totalYearly}/year)
                  </p>
                )}

                <div className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-200"
                    >
                      <Check className="h-4.5 w-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={btnConfig.disabled || isProcessing || loadingPlan !== null}
                onClick={() => handlePlanAction(plan.name, btnConfig.disabled)}
                className={`mt-8 w-full rounded-2xl py-3.5 text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] ${btnConfig.style}`}
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {btnConfig.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Plan Status Banner */}
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15 max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
        <div className="rounded-2xl border border-white/8 bg-[#0b1220] p-3 flex-shrink-0">
          {isElite ? (
            <Sparkles className="h-6 w-6 text-emerald-400" />
          ) : isPro ? (
            <Crown className="h-6 w-6 text-violet-400" />
          ) : (
            <Crown className="h-6 w-6 text-slate-400" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-white text-lg">
            {isElite
              ? "Elite Member Status"
              : isPro
              ? "Pro Member Status"
              : "Free Plan Limits"}
          </h4>
          <p className="text-sm text-slate-400 mt-1 leading-relaxed">
            {isElite
              ? "You are on our highest tier plan! You have full unlimited access to all features, AI coaching, MT5 sync, and TradingView backtesting chat."
              : isPro
              ? "You have unlimited AI coaching and MT5 integration. Upgrade to Elite to unlock TradingView backtesting chat and team tools."
              : "AI Coach is text-only on the free plan and is limited to 10 requests per day. Upgrade to Pro or Elite for unlimited coaching, real-time sync with MT5 terminal, and advanced risk calculator workspace."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <DashboardLayout>
      <PlansContent />
    </DashboardLayout>
  );
}

