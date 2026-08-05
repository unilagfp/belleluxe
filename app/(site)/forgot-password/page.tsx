"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { OtpInput } from "@/components/ui/OtpInput";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setError(error.message);
      setLoading(false);
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
      type: "recovery",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setStep("reset");
    setLoading(false);
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  if (step === "reset") {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Set a new password</h1>
        <form onSubmit={handleReset} className="mt-8 flex flex-col gap-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="mt-2 w-full">
            Update password
          </Button>
        </form>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Enter your code</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to <strong>{email}</strong>.
        </p>
        <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} disabled={otp.length < 6} className="mt-2 w-full">
            Verify code
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a 6-digit code.
      </p>

      <form onSubmit={handleRequest} className="mt-8 flex flex-col gap-4">
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" loading={loading} className="mt-2 w-full">
          Send code
        </Button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
