"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Bell, Palette, UserCog } from "lucide-react";
import EditProfileModal from "@/components/settings/EditProfileModal";

const generalSettings = [
  {
    title: "Notifications",
    description: "Turn on alerts for trade updates, coach insights, and account changes.",
    icon: Bell,
  },
  {
    title: "Profile",
    description: "Update your name, email, and public display preferences.",
    icon: UserCog,
  },
  {
    title: "Appearance",
    description: "Choose the dashboard look and dark theme behavior.",
    icon: Palette,
  },
];

export default function SettingsPage() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleManageClick = (title: string) => {
    if (title === "Profile") {
      setProfileModalOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15">
          <p className="text-sm text-slate-400">Settings</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            General preferences and customization
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Adjust your workspace behavior, notification alerts, and appearance preferences.
          </p>
        </div>

        <section className="grid gap-6 xl:grid-cols-3">
          {generalSettings.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/8 bg-white/[0.03] p-6 shadow-xl shadow-black/15"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/8 bg-[#0b1220] p-3">
                  <item.icon className="h-5 w-5 text-violet-300" />
                </div>
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {item.description}
              </p>
              <button
                onClick={() => handleManageClick(item.title)}
                className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10 active:scale-[0.98]"
              >
                Manage
              </button>
            </div>
          ))}
        </section>
      </div>

      <EditProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </DashboardLayout>
  );
}
