import path from "path";
import fs from "fs";

export async function saveFile(file: File, directory: string) {
  const filePath = path.join(directory, file.name);
  const fileStream = fs.createWriteStream(filePath);
  const readableStream = file.stream();

  await new Promise<void>((resolve, reject) => {
    const reader = readableStream.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        fileStream.end();
        resolve();
        return;
      }
      fileStream.write(value);
      pump();
    };
    pump().catch(reject);
  });

  return filePath; // Return the path for further use
}
