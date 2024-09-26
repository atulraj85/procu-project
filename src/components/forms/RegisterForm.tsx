"use client";

import { registerUser } from "@/actions/auth";
import { IoEye, IoEyeOff } from "react-icons/io5";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { CreateUserInputValidation } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import MainButton from "../common/MainButton";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { textAlign } from "html2canvas/dist/types/css/property-descriptors/text-align";

const FormSchema = CreateUserInputValidation;

type RegisterFormProps = {
  text: string;
  role: string
};

function RegisterForm({ text, role }: RegisterFormProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();

  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      mobile: "",
      password: "",
      role: role
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      registerUser(data)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data?.success);
            toast({
              title: "🎉 Registration success",
              description: data.success,
            });
          }
        })
        .catch(() => {
          setError("Something went wrong!");
        });
    });
  }

  return (
    <div className="w-full  flex flex-col gap-[2.81rem] justify-center items-center h-screen px-4 lg:px-[4rem] lg:mr-16  ">
      <div className="self-start">
        <p className="text-[#333] text-[1.625rem] font-[700]">Hello!</p>
        <p className="text-[#333] text-[1.125rem]">{text}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-6"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full name"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="user"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Company"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="user"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email Address"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Phone Number"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="phone"
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
                      startIcon="padlock"
                      className="h-[3.75rem] w-full rounded-large"
                      type={showPassword ? "text" : "password"}
                    />
                  </FormControl>

                  <FormMessage />
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
            text="Register"
            classes="h-[3.31rem] rounded-large"
            width="full_width"
            isSubmitable
            isLoading={isPending}
          />
          <div className="flex justify-center font-bold text-[14px] text-[#191A15] mt-4">
            <Link href="/auth/login">Login Instead?</Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default RegisterForm;
