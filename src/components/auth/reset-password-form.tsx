"use client";

import { resetPassword } from "@/actions/auth";
import MainButton from "@/components/common/MainButton";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResetPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
  });

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      resetPassword(values, token).then((data) => {
        setError(data?.error);
        setSuccess(data?.success);
      });
    });
  };

  return (
    <div className="w-full  flex flex-col gap-[2.81rem] justify-center items-center h-screen px-4 lg:px-[4rem] lg:mr-16  ">
      <div className="self-start">
        <p className="text-[#333] text-[1.625rem] font-[700]">
          Pr<span className="text-[#03B300]">o</span>cu
        </p>
        <p className="text-[#333] text-[1.125rem]">Enter a new password</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Password"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="padlock"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <MainButton
            text="Reset password"
            classes="h-[3.31rem] rounded-large"
            width="full_width"
            isSubmitable
            isLoading={isPending}
          />

          <div className="flex justify-center font-bold text-[14px] text-[#191A15] mt-4">
            <Link href="/auth/login">Back to login</Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
