import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";

interface PDFUploaderProps {
  onFileUpload: (file: File | null) => void;
  currentFile: File | null;
}

const PDFuploader: React.FC<PDFUploaderProps> = ({
  onFileUpload,
  currentFile,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [openDialogBox, setOpenDialogBox] = useState<boolean>(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile && !selectedFile.type.includes("pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    setError(null); // Clear any previous errors

    if (currentFile && selectedFile) {
      setPendingFile(selectedFile);
      setOpenDialogBox(true);
    } else {
      onFileUpload(selectedFile);
    }
  };

  const handleConfirmChange = () => {
    onFileUpload(pendingFile);
    setPendingFile(null);
    setOpenDialogBox(false);
  };

  const handleUpload = async () => {
    if (!currentFile) {
      setError("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", currentFile);

    try {
      const response = await fetch(`/api/uploads`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      toast.success("File uploaded successfully");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("File upload failed.");
    }
  };

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      {openDialogBox && (
        <>
          <div className="fixed inset-0 bg-black opacity-50 z-20 pointer-events-none"></div>
          <div className="fixed inset-0 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded shadow-md text-center">
              <div className="mb-4">
                Are you sure you want to overwrite the existing file?
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500"
                  onClick={handleConfirmChange}
                >
                  Yes
                </button>
                <button
                  className="bg-red-400 text-white px-4 py-2 rounded hover:bg-red-300"
                  onClick={() => setOpenDialogBox(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="flex flex-row justify-center items-center gap-2">
        <label
          htmlFor="fileInput"
          className="cursor-pointer transition duration-300"
        >
          <Image
            src="/assets/upload.png"
            alt="Upload PDF"
            className="border p-0.5"
            width={20}
            height={20}
          />
          <input
            type="file"
            accept="application/pdf"
            id="fileInput"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {currentFile && <p>{currentFile.name}</p>}
        <button
          onClick={handleUpload}
          className="border-2 rounded-sm px-2 bg-blue-600 text-white hover:cursor-pointer"
        >
          Upload
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default PDFuploader;
