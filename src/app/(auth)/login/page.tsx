
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-muted-foreground">Enter your credentials to access your dashboard.</p>
      </div>
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                    Forgot your password?
                </Link>
            </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline font-medium hover:text-primary">
          Sign up
        </Link>
      </div>
    </div>
  );
}
