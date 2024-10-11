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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "../shared/Loader";

type FormValues = z.infer<typeof AddressformSchema2>;

interface AddressFormProps {
  companyId: string | null;
  isAddingAddress: () => void;
  setRfpAddress: React.Dispatch<React.SetStateAction<string>>;
}

const NewAddress: React.FC<AddressFormProps> = ({
  companyId,
  isAddingAddress,
  setRfpAddress
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [cities, setCities] = useState<{ value: string; label: string }[]>([]);
  const [currentState, setCurrentState] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(AddressformSchema2),
    defaultValues: {
    //   addressName: "", 
      street: "",
      country: "INDIA",
      state: "",
      city: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);


    const {street, city, postalCode, state, country  } = data;

    const address = `${street}, ${city}, ${postalCode}, ${state}, ${country}`;
    console.log(address);

    setRfpAddress(address);

    toast({
            title: "Success",
            description: "Delivery Address Selected",
            
          });
          setIsSaving(false);

    //   console.log("fomr data", data);
    // const formDataWithAddressType = {
    //   ...data,
    //   addressType: "SHIPPING",
    //   state: currentState,
    // };

    // try {
    //   const response = await fetch(`/api/company/${companyId}/address`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(formDataWithAddressType),
    //   });

    //   if (response.ok) {
    //     const result = await response.json();
    //     console.log("Address added successfully:", result);
    //     toast({
    //       title: "Success",
    //       description: "Address added successfully!",
    //       duration: 3000,
    //     });
    //     isAddingAddress();
    //   } else {
    //     console.error("Failed to add address:", response.statusText);
    //     toast({
    //       title: "Error",
    //       description: "Failed to add address. Please try again.",
    //       variant: "destructive",
    //       duration: 3000,
    //     });
    //   }
    // } catch (error) {
    //   console.error("Error submitting form:", error);
    //   toast({
    //     title: "Error",
    //     description: "An error occurred. Please try again.",
    //     variant: "destructive",
    //     duration: 3000,
    //   });
    // } finally {
    //   setIsSaving(false);
    // }
  };

  useEffect(() => { 
    const fetchStates = async () => {
      try {
        const response = await fetch("/api/address/states/IN");
        if (!response.ok) {
          
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Transform the data into the desired format
        const transformedStates = data.map(
          (state: { code: any; name: any }) => ({
            value: state.code,
            label: state.name,
          })
        );
        setIsLoading(true);

        console.log("transformedStates", transformedStates);

        setStates(transformedStates); // Set the states in the state
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchStates(); // Call the fetch function
  }, []);
  // useEffect(() => {
  const fetchCities = async (value: string) => {
    console.log(currentState);
    if (value) {
      try {
        const response = await fetch(`/api/address/cities/IN/${value}`);
        if (!response.ok) {

          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        const transformedCities = data.map((city: { name: any }) => ({
          value: city.name,
          label: city.name,
        }));

        setCities(transformedCities);
      } catch (error) {
        console.error("There was a problem fetching cities:", error);
      }
    }
  };

  // fetchCities();
  // }, [currentState]);

  const handleStateChange = (value: any) => {
    const selectedState = states.find((state) => state.value === value);
    setCurrentState(selectedState ? selectedState.label : "");
    form.setValue("state", value);
    fetchCities(value);
  };


  if(!isLoading){
    return <Loader/>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div>Delivery Address</div>
              <Button className="w-28 bg-primary" onClick={isAddingAddress}>
                Back
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                {/* <FormField
                  control={form.control}
                  name="addressName"
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
                /> */}
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
                        <Input {...field} disabled/>
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
                      {/* {currentState && (
                        <p className="text-sm text-gray-500 mt-1">
                          Current State: {currentState}
                        </p>
                      )} */}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                {isSaving ? "Saving..." : "New Address"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default NewAddress;
