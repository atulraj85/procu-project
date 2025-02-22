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
import MainButton from "@/components/common/MainButton";
import Link from "next/link";
import { CreateUserInputValidation } from "@/lib/validations";
import { useState } from "react";
import makeApiCallService from "@/service/apiService";
import { ICreateUserResponse } from "@/types";
import { useRouter } from "next/navigation";
import { textAlign } from "html2canvas/dist/types/css/property-descriptors/text-align";

const FormSchema = CreateUserInputValidation;

interface RegisterFormProps {
  apiUrl: string; // API URL passed as a prop
  loginPage: string;
  text:string;
}

function RegisterForm({ apiUrl,loginPage, text}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      mobile: "",
      password: "",   
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoading(true);

      const dataWithRole = {
        ...data,
        role: "ADMIN",
      };

      
      console.log(dataWithRole);

      const response = await makeApiCallService<ICreateUserResponse>(apiUrl, {
        method: "POST",
        body: dataWithRole,
      });

      if (response?.response?.meta?.success) {
        toast({
          title: "🎉 Registration success",
          description: response?.response?.meta?.message,
        });

        form.reset({
          name: "",
          company: "",
          email: "",
          mobile: "",
          password: "",
        });
  

        router.push("/login");
      }

      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
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

          <MainButton
            text="Register"
            classes="h-[3.31rem] rounded-large"
            width="full_width"
            isSubmitable
            isLoading={loading}
          />

          <div className="flex justify-center font-bold text-[14px] text-[#191A15] mt-4">
            <Link href={loginPage}>Login Instead?</Link>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default RegisterForm;
