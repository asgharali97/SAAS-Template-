"use client";
import React, { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const { setActive, isLoading, signIn } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await signIn?.create({
        identifier: emailAddress,
        password,
      });
      console.log(res);
      if (res?.status === "complete") {
        await setActive({ session: res?.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error(JSON.stringify(res, null, 2));
      }
    } catch (error: any) {
      console.log({ error }, 2, null);
      setError(error.errors[0]);
    }
  }

  return (
    <>
      <div className="h-full w-full flex justify-center bg-[var(--background)] py-22 px-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              SignIn And Enjoy The Features
            </CardTitle>
            <CardContent>
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
                  SingIn
                </Button>
              </form>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </>
  );
};

export default SignIn;
