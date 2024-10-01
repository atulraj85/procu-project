"use client";

import { loginUser } from "@/actions/auth/";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { IoEye,IoEyeOff } from "react-icons/io5";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import MainButton from "../common/MainButton";
import { Button } from "../ui/button";

interface LoginFormProps {
  api: string; // The API endpoint for the login request
  registerPage: string; // The URL for the register page
}

function LoginForm({ api}: any) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      loginUser(data)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data?.success);
          }
        })
        .catch(() => {
          setError("Something went wrong!");
        });
    });
  }

  return (
    <div className="w-full flex flex-col gap-[2.81rem] justify-center items-center h-screen px-4 lg:px-[4rem] lg:mr-16">
      <div className="self-start">
        <p className="text-[#333] text-[1.625rem] font-[700]">
          Pr<span className="text-[#03B300]">o</span>cu
        </p>
        <p className="text-[#333] text-[1.125rem]">Procurement Management System</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Email Address"
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="email"
                    type="email"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <div className="relative">
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Password"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="padlock"
                    type={showPassword ? "text" : "password"}
                    
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
                <Button asChild size="sm" variant="link" className="px-0">
                  <Link href="/auth/forgot-password">Forgot password?</Link>
                </Button>
              </FormItem>
              <span
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-2xl opacity-55"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </span>
            </div>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <MainButton
            text="Login"
            classes="h-[3.31rem] rounded-large"
            width="full_width"
            isSubmitable
            isLoading={isPending}
          />
          <div className="flex justify-center font-bold text-[14px] text-[#191A15] mt-4">
            <Link href="/auth/register">Register Instead?</Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default LoginForm;
