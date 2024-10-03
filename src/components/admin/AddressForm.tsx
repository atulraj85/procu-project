import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addresses } from "@/app/(protected)/dashboard/admin/company/address";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AddressformSchema } from "@/schemas/Company";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof AddressformSchema>;

interface AddressFormProps {
  companyId: string | null;
  isAddingAddress: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  companyId,
  isAddingAddress,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(AddressformSchema),
    defaultValues: {
      title: "",
      street: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log(data);
    addresses.push(data);
    isAddingAddress();
    // try {
    //   const response = await fetch(`/api/company?companyId=${companyId}`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data.deliveryAddress),
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to update address');
    //   }

    //   console.log('Address updated successfully');

    // } catch (error) {
    //   console.error('Error updating address:', error);
    // }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>

            <CardTitle className="flex justify-between items-center"> <div>Delivery Address</div> 
            <Button className=" w-28  bg-primary" onClick={()=>{isAddingAddress()}}>Back</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Title</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Home, Office, Warehouse"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="mt-4 w-28 my-4 bg-primary">
                ADD
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default AddressForm;
