import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { useToast } from "@/components/ui/use-toast";
import { AddressformSchema2 } from "@/schemas/Company";
import { AddressformSchema } from "@/schemas/Company";
import { AddressInterface } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Loader from "../shared/Loader";

type FormValues = z.infer<typeof AddressformSchema>;
// type AdrresProp = z.infer<typeof AddressformSchema>;

interface AddressFormProps {
  companyId: string;
  addressProp: AddressInterface | null;
  setAddressProp: React.Dispatch<React.SetStateAction<AddressInterface | null>>;
}

const Edit: React.FC<AddressFormProps> = ({ addressProp, setAddressProp, companyId }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currState, setCurrState] = useState<string>("");
    console.log(addressProp?.id);
  const form = useForm<FormValues>({
    resolver: zodResolver(AddressformSchema),
    defaultValues: {
    addressName:addressProp?.addressName,
      street: addressProp?.street || "",
      country: "INDIA",
      postalCode: addressProp?.postalCode || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    const formData = {
      ...data,
      addressType: "SHIPPING",
    };

    try {
      const response = await fetch(`/api/company/${companyId}/address/${addressProp?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update address");
      }
      window.location.reload();
      toast({
        title: "Success",
        description: "Address updated successfully",
      });

    //   form.reset({
    //     addressName:data.?addressName,
    //     street: data?.street || "",
    //     country: "INDIA",
    //     state: data?.state || "",
    //     city: data?.city || "",
    //     postalCode: data?.postalCode || "",
    //   });
    } catch (error) {
      console.error("Error updating address", error);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch("/api/address/states/IN");
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      const transformedStates = data.map((state: { code: string; name: string }) => ({
        value: state.code,
        label: state.name,
      }));

      setStates(transformedStates);
      return transformedStates;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return [];
    }
  };

  const fetchCities = async (stateCode: string) => {
    if (stateCode) {
      try {
        const response = await fetch(`/api/address/cities/IN/${stateCode}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        const transformedCities = data.map((city: { name: string }) => ({
          value: city.name,
          label: city.name,
        }));

        setCities(transformedCities);
        return transformedCities;
      } catch (error) {
        console.error("There was a problem fetching cities:", error);
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    const initializeForm = async () => {
      const fetchedStates = await fetchStates();
      if (fetchedStates.length > 0 && addressProp?.state) {
        const selectedState = fetchedStates.find(
          (state: { value: string; label: string }) =>
            state.label.toLowerCase() === addressProp.state.toLowerCase()
        );
        if (selectedState) {
          setCurrState(selectedState.label);
          form.setValue("state", selectedState.value);

          const fetchedCities = await fetchCities(selectedState.value);
          if (fetchedCities.length > 0 && addressProp.city) {
            const selectedCity = fetchedCities.find(
              (city: { value: string }) =>
                city.value.toLowerCase() === addressProp.city.toLowerCase()
            );
            if (selectedCity) {
              form.setValue("city", selectedCity.value);
              setIsLoading(true);
            }
          }
        }
      }
    };

    initializeForm();
  }, [addressProp, form]);

  const handleStateChange = async (value: string) => {
    const selectedState = states.find((state) => state.value === value);
    if (selectedState) {
      setCurrState(selectedState.label);
    }

    form.setValue("state", value);
    form.setValue("city", ""); // Reset city when state changes
    await fetchCities(value);
  };

  const handleCityChange = (value: string) => {
    form.setValue("city", value);
  };

  if (!isLoading) {
    return <Loader />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>


            <div className="flex flex-col gap-4">

            <div className="w-[30%]">
            <FormField
                control={form.control}
                name="addressName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

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
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
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
                      <Select onValueChange={handleStateChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {states.map((state) => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={handleCityChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postalCode"
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
              <Button type="submit" className="mt-4 w-28 my-4 bg-primary" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default Edit;
