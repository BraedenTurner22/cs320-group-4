"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError("Enter your email first");
      return;
    }
    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setError("");
      alert("Password reset email sent!");
    } catch {
      setError("Failed to send reset email");
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      {/* Glass card */}
      <div className="w-full max-w-md rounded-2xl bg-ember p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              <span>Skill</span>
              <span>-It</span>
            </h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/skillit_logo.png"
              alt="Skill-It logo"
              className="rounded-md"
              style={{ width: 50, height: 50 }}
            />
          </div>
          <p className="text-white/80 text-sm">
            Welcome back — sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 [&_label]:!text-white/80">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@umass.edu"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
          />

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit" 
            disabled={loading} 
            className="w-full mt-1 !bg-white !text-ember !hover:bg-white/90 border-transparent shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm">
          <button
            onClick={handleForgotPassword}
            className="text-white/80 hover:text-white transition-colors cursor-pointer text-xs"
          >
            Forgot password?
          </button>
          <p className="!text-white/80">
            No account?{" "}
            <Link
              href="/signup"
              className="font-bold text-white transition-colors hover:text-white/90 underline decoration-white/80 underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
