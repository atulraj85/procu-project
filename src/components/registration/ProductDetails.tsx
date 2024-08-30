"use client";
import productCategory from "@/lib/productCategory";
import React, { useState } from "react";
import { createFilter } from "react-select";
import makeAnimated from "react-select/animated";
import CreatableSelect from "react-select/creatable";
import { ActionMeta, MultiValue } from "react-select";

const animatedComponents = makeAnimated();

interface OptionsInterface {
  value: string;
  label: string;
}

const initialCategoryOptions: OptionsInterface[] = [...productCategory];

export default function ProductDetails() {
  const filterOption: any = {
    ignoreCase: true,
    ignoreAccents: false,
    trim: true,
    matchFrom: "start",
  };

  const [categoryOptions, setCategoryOptions] = useState<OptionsInterface[]>(
    initialCategoryOptions
  );
  const [productOption, setProductOption] = useState<OptionsInterface[]>([]);
  const [serviceOption, setServiceOption] = useState<OptionsInterface[]>([]);
  
  const handleProductChange = (
    newValue: MultiValue<OptionsInterface>,
    actionMeta: ActionMeta<OptionsInterface>
  ) => {
    setProductOption(newValue as OptionsInterface[]);
  };

  const handleServiceChange = (
    newValue: MultiValue<OptionsInterface>,
    actionMeta: ActionMeta<OptionsInterface>
  ) => {
    setServiceOption(newValue as OptionsInterface[]);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-screen">
      <h1 className="text-xl">
        Please add the list of Product/Service you deal with :
      </h1>
      <div className="flex-style mt-6 ">
        <label htmlFor="product">Product :</label>

        <CreatableSelect
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              width: "380px",
              border: "none",
            }),
          }}
          closeMenuOnSelect={false}
          components={animatedComponents}
          isMulti
          closeMenuOnScroll
          options={categoryOptions}
          onChange={handleProductChange}
          filterOption={createFilter(filterOption)}
        />
      </div>
      <div className="flex-style mt-6">
        <label htmlFor="services">Services :</label>

        <CreatableSelect
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              width: "380px",
              border: "none",
              borderColor: state.isFocused ? "grey" : "red",
            }),
          }}
          closeMenuOnSelect={false}
          components={animatedComponents}
          isMulti
          options={categoryOptions}
          onChange={handleServiceChange}
          filterOption={createFilter(filterOption)}
        />
      </div>
    </div>
  );
}
