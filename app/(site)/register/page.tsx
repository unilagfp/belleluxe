"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "verify">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/account");
      router.refresh();
      return;
    }

    setStep("verify");
    setLoading(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/account");
    router.refresh();
  }

  async function handleResend() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
  }

  if (step === "verify") {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
        </p>

        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
          <div>
            <Label htmlFor="otp">Verification code</Label>
            <Input
              id="otp"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            Verify & continue
          </Button>
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Didn&apos;t get a code? Resend
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Create an account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Save your details for faster checkout and order tracking.
      </p>

      <form onSubmit={handleSignUp} className="mt-8 flex flex-col gap-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
