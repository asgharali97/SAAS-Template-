"use client";
import React, { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const { setActive, isLoading, signUp } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [pendingVerificationCode, setPendingVerificationCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  if (!isLoading) {
    <Skeleton className="h-[20px] w-[100px] rounded-full" />;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoading) {
      <Skeleton className="h-[20px] w-[100px] rounded-full" />;
    }
    try {
      await signUp?.create({
        emailAddress,
        password,
      });

      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setPendingVerificationCode(true);
    } catch (error: any) {
      setError(error.message);
      console.log({ error }, 2, null);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoading) {
      <Skeleton className="h-[20px] w-[100px] rounded-full" />;
    }
    const completeSignup = await signUp?.attemptEmailAddressVerification({
      code,
    });

    if (completeSignup?.status !== "complete") {
      console.log(JSON.stringify(completeSignup, null, 2));
    }

    if (completeSignup?.status === "complete") {
      await setActive({ session: completeSignup.createdSessionId });
      router.push("/dashboard");
    }

    try {
    } catch (error: any) {
      setError(error.message);
      console.log({ error }, 2, null);
    }
  }
  return (
    <>
      <div className="h-full w-full flex justify-center bg-[var(--background)] py-22 px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div id="clerk-captcha"></div>
            <CardTitle className="text-center">
              SignUp And Enjoy The Features
            </CardTitle>
            <CardContent>
              {!pendingVerificationCode ? (
                <form onSubmit={submit} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                      className="my-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="my-2"
                      />
                      <div
                        className="absolute top-5 right-2 -traslate-y-1/2 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-300" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                  {error && (
                    <Alert variant="descurtive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="cursor-pointer ">
                    SingUp
                  </Button>
                </form>
              ) : (
                <form onSubmit={verify} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label>Verifaction Code</Label>
                    <Input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                      placeholder="Enter Verifaction Code"
                      className="my-2"
                    />
                  </div>
                  {error && (
                    <Alert variant="descurtive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="cursor-pointer ">
                    Verify
                  </Button>
                </form>
              )}
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </>
  );
};

export default SignUp;
