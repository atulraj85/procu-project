"use client"
import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^\d{10}$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  profilePhoto: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const AutoFillRegisterForm: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const router = useRouter();
  const userId = localStorage.getItem("USER_ID");

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      mobile: "",
      password: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users?id=${userId}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const user = data[0];
          form.setValue('name', user.name);
          form.setValue('email', user.email);
          form.setValue('mobile', user.mobile);
          
          form.setValue('company', user.companyName || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [form]);

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("profilePhoto", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);

      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "profilePhoto" && data[key]) {
          formData.append(key, data[key] as File);
        } else {
          formData.append(key, data[key as keyof FormValues]?.toString() || "");
        }
      });

      const response = await fetch("/api/users/", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (result.meta?.success) {
        toast({
          title: "🎉 Registration success",
          description: result.meta?.message,
        });
        router.push("/login");
      } else {
        toast({
          title: "Registration failed",
          description: result.meta?.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-[2.81rem] justify-center items-center min-h-screen px-4 lg:px-[4rem] lg:mr-16">
      <div className="self-start">
        
        <p className="text-[#333] text-[1.125rem]"> update Profile</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full name"
                    {...field}
                    className="py-3 w-full rounded-large"
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
                    className="py-3 w-full rounded-large"
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
                    className="py-3 w-full rounded-large"
                    type="email"
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
                    className="py-3 w-full rounded-large"
                    type="tel"
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
                      className="py-3 w-full rounded-large pr-10"
                      type={showPassword ? "text" : "password"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <span
                  className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-2xl opacity-55"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoEyeOff /> : <IoEye />}
                </span>
              </div>
            )}
          />

          <FormField
            control={form.control}
            name="profilePhoto"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        field.onChange(e.target.files?.[0]);
                        handleProfilePhotoChange(e);
                      }}
                      className="py-3 w-full rounded-large"
                    />
                    {profilePhotoPreview && (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="py-3 rounded-large"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Information"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AutoFillRegisterForm;