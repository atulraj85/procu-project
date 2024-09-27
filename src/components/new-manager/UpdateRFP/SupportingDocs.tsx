import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AlertCircle, PlusIcon, X } from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Control, UseFormSetValue, useFieldArray } from "react-hook-form";

type SupportingDocument = {
  id?: any;
  documentType?: any;
  documentName?: any;
  location?: any;
  name?: string;
  fileName?: string;
};

const SupportingDocumentsList = ({
  errors,
  control,
  index,
  setValue,
  files,
  setFiles,
  getValues,
}: {
  errors: any;
  control: Control<any>;
  index: number;
  setValue: UseFormSetValue<any>;
  getValues: any;
  files: { [key: string]: File };
  setFiles: React.Dispatch<React.SetStateAction<{ [key: string]: File }>>;
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `quotations.${index}.supportingDocuments`,
  });
  const [fileError, setFileError] = useState("");

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    docIndex: number
  ) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (file) {
      const documentName = getValues(
        `quotations.${index}.supportingDocuments.${docIndex}.name`
      );
      const fileKey = `${getValues(
        `quotations.${index}.vendorId`
      )}/${documentName}`;
      setFiles((prevFiles) => ({
        ...prevFiles,
        [fileKey]: file,
      }));
      setValue(
        `quotations.${index}.supportingDocuments.${docIndex}.fileName`,
        file.name
      );
    }
    if (!file) {
      setFileError("Please upload a file.");
      return;
    }
  };

  const handleDelete = (docIndex: number) => {
    // Remove the document from the fields array
    remove(docIndex);

    // Remove the document from the form data
    const currentDocs = getValues(`quotations.${index}.supportingDocuments`);
    const updatedDocs = currentDocs.filter(
      (_: any, i: number) => i !== docIndex
    );
    setValue(`quotations.${index}.supportingDocuments`, updatedDocs);

    // Remove the file from the files state if it exists
    const documentName = getValues(
      `quotations.${index}.supportingDocuments.${docIndex}.name`
    );
    const fileKey = `${getValues(
      `quotations.${index}.vendorId`
    )}/${documentName}`;
    setFiles((prevFiles) => {
      const newFiles = { ...prevFiles };
      delete newFiles[fileKey];
      return newFiles;
    });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 mb-2">
            <Label>Name</Label>
            <Label>File</Label>
          </div>

          <div className="flex">
            <div className="grid grid-cols-1 justify-between">
              {fields.map((field, docIndex) => {
                const location = getValues(
                  `quotations.${index}.supportingDocuments.${docIndex}.location`
                );
                const isFileUploaded = !!location;

                return (
                  <div key={field.id} className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <Input
                        {...control.register(
                          `quotations.${index}.supportingDocuments.${docIndex}.name`
                        )}
                        placeholder="Enter document name"
                      />
                      {errors?.quotations?.[index]?.supportingDocuments?.[
                        docIndex
                      ]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {
                            errors.quotations[index].supportingDocuments[
                              docIndex
                            ].name.message
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      {isFileUploaded ? (
                        <Input
                          type="text"
                          value={location}
                          disabled
                          className="bg-gray-100"
                        />
                      ) : (
                        <Input
                          type="file"
                          onChange={(e) => handleFileChange(e, docIndex)}
                        />
                      )}
                      {fileError && ( // Assuming fileError is the state for file validation
                        <p className="text-red-500 text-sm mt-1">{fileError}</p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <div className="flex flex-col">
                        <Label className="font-bold text-[16px] text-slate-700"></Label>
                        <Button
                          type="button"
                          onClick={() => handleDelete(docIndex)}
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              className="bg-primary"
              onClick={() => append({ name: "", fileName: "" })}
            >
              <PlusIcon />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportingDocumentsList;
