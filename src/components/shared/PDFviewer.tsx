// "use client";

// import { useEffect, useRef } from "react";
// import * as pdfjsLib from "pdfjs-dist/build/pdf";

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

// export default function PDFviewer({ filePath }: { filePath: string }) {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const renderPDF = async () => {
//       if (!filePath) return;

//       const pdf = await pdfjsLib.getDocument(filePath).promise;
//       const page = await pdf.getPage(1);
//       const viewport = page.getViewport({ scale: 1.5 });
//       const canvas = canvasRef.current;
//       const context = canvas?.getContext("2d");
//       if (canvas && context) {
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;

//         const renderContext = {
//           canvasContext: context,
//           viewport,
//         };

//         page.render(renderContext);
//       }
//     };

//     renderPDF();
//   }, [filePath]);

//   return <canvas ref={canvasRef}></canvas>;
// }
