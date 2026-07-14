"use client";

import { useState } from "react";
import { login } from "@/services/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const data = await login(email, password);

      localStorage.setItem("token", data.access_token);

      alert("Login Successful 🚀");

      window.location.href = "/dashboard";
    } catch (err) {
      alert("Invalid email or password");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020817]">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl bg-slate-900 p-8 space-y-5"
      >
        <h1 className="text-3xl font-bold text-white">
          Login to JournalX
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full rounded-lg p-3 bg-slate-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg p-3 bg-slate-800 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded-lg bg-blue-600 py-3 text-white"
        >
          Login
        </button>
      </form>
    </main>
  );
}