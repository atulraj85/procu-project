"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { IoEye,IoEyeOff } from "react-icons/io5";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import MainButton from "../common/MainButton";
import Link from "next/link";
import { useState } from "react";
import makeApiCallService from "@/service/apiService";
import { useRouter } from "next/navigation";
import { ILoginUserResponse } from "@/types";

const FormSchema = z.object({
  email: z
    .string()
    .email({
      message: "Enter a valid email",
    })
    .min(2, {
      message: "Email must be at least 2 characters.",
    }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .max(25, {
      message: "Password must be at most 25 characters.",
    }),
});

interface LoginFormProps {
  api: string; // The API endpoint for the login request
  registerPage: string; // The URL for the register page
}

function LoginForm({ api, registerPage}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true);

      const response = await makeApiCallService<ILoginUserResponse>(api, {
        method: "POST",
        body: data,
      });

      if (response?.response?.meta?.success) {
        // Store the token and role in local storage
        localStorage.setItem("TOKEN", response?.response?.data?.token);
        localStorage.setItem("USER_ROLE", response?.response?.data?.role); // Store the role
        localStorage.setItem("USER_ID", response?.response?.data?.userId);

        toast({
          title: "🎉 Login success",
          description: response?.response?.meta?.message,
        });

        console.log(localStorage.getItem("USER_ROLE"));
          router.push("/dashboard");

        // if(localStorage.getItem("USER_ROLE") == "ADMIN"){
        //   router.push("/dashboard/admin/company");
        // } else {
        //   router.push("/dashboard/admin/company");
        // }
        
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast({
        title: "Error",
        description: "An error occurred during login.",
      });
    }
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
                    placeholder="Email Address"
                    {...field}
                    className="h-[3.75rem] w-full rounded-large"
                    startIcon="email"
                    type="email"
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

          <MainButton
            text="Login"
            classes="h-[3.31rem] rounded-large"
            width="full_width"
            isSubmitable
            isLoading={loading}
          />

          <div className="flex justify-center font-bold text-[14px] text-[#191A15] mt-4">
            <Link href={registerPage}>Register Instead?</Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default LoginForm;
