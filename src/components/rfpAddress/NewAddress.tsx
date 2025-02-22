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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Loader from "../shared/Loader";

type FormValues = z.infer<typeof AddressformSchema2>;
// type AdrresProp = z.infer<typeof AddressformSchema>;
interface AddressFormProps {
  isAddingAddress: () => void;
  setRfpAddress: React.Dispatch<React.SetStateAction<string>>;
  setSelectedAddr: React.Dispatch<React.SetStateAction<string | null>>;
  handleNewAdress: ()=> void;
  setAddressProp:React.Dispatch<React.SetStateAction<FormValues | null>>;
}

const NewAddress: React.FC<AddressFormProps> = ({
  setAddressProp,
  isAddingAddress,
  setRfpAddress,
  setSelectedAddr,
  handleNewAdress
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currState, setCurrState] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(AddressformSchema2),
    defaultValues: {
      street: "",
      country: "INDIA",
      state: "",
      city: "",
      postalCode: "",
    },
  });
const onSubmit = async (data: FormValues) => {
  setIsSaving(true);

  setAddressProp(data);

  const { street, city, postalCode, state, country } = data;
  const address = `${street}, ${city}, ${postalCode}, ${currState}, ${country}`;

  // Move these after the form reset and state updates
  form.reset();
  setIsSaving(false);

  // Now update the parent states
  setRfpAddress(address);
  setSelectedAddr(address);

  // Call these last
  handleNewAdress();
  isAddingAddress();

  toast({
    title: "Success",
    description: "Delivery Address Selected",
  });
};
  useEffect(() => { 
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/address/states/IN");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const transformedStates = data.map(
          (state: { code: string; name: string }) => ({
            value: state.code,
            label: state.name,
          })
        );

        setStates(transformedStates);
        setIsLoading(true);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchStates();
  }, []);

  const fetchCities = async (stateCode: string) => {
    if (stateCode) {
      try {
        const response = await fetch(`/api/address/cities/IN/${stateCode}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const transformedCities = data.map((city: { name: string }) => ({
          value: city.name,
          label: city.name,
        }));

        setCities(transformedCities);
      } catch (error) {
        console.error("There was a problem fetching cities:", error);
      }
    }
  };

  const handleStateChange = (value: string) => {
    const selectedState = states.find((state)=> state.value === value);
    if(selectedState){
      setCurrState(selectedState?.label);
    }
    
    form.setValue("state", value);
    form.setValue("city", ""); // Reset city when state changes
    fetchCities(value);
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
            <CardTitle>New Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
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
                      <Select
                        onValueChange={handleStateChange}
                        value={field.value}
                      >
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
                      <Select
                        onValueChange={handleCityChange}
                        value={field.value}
                      >
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
              <Button
                type="submit"
                className="mt-4 w-28 my-4 bg-primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Add"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default NewAddress;