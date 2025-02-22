"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function InputOTPPattern() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col items-center justify-center">
              <FormLabel className="text-xl mt-2 text-center">
                Enter the code
              </FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup className="flex items-center justify-center">
                    <InputOTPSlot
                      index={0}
                      className="border-2 border-black text-xl mx-1"
                    />
                    <InputOTPSlot
                      index={1}
                      className="border-2 border-black text-xl mx-1"
                    />
                    <InputOTPSlot
                      index={2}
                      className="border-2 border-black text-xl mx-1"
                    />
                    <InputOTPSlot
                      index={3}
                      className="border-2 border-black text-xl mx-1"
                    />
                    <InputOTPSlot
                      index={4}
                      className="border-2 border-black text-xl mx-1"
                    />
                    <InputOTPSlot
                      index={5}
                      className="border-2 border-black text-xl mx-1"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription className="text-base text-center">
                Haven’t got the code yet?{" "}
                <button className=" text-blue-800 ">Resend code</button>
                <Button type="submit" className="w-full text-lg">
                  Verify Code
                </Button>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
