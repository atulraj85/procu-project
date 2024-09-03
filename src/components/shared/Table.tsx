import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import autoTable from "jspdf-autotable";

interface TableColumn {
  key: string;
  header: string;
}

interface TableProps {
  title: string;
  titles: TableColumn[];
  content: any[];
}

const Table: React.FC<TableProps> = ({ title, titles, content }) => {
  const exportToPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(title, 10, 10);

    const tableData = content.map((row) =>
      titles.map((title) => row[title.key])
    ); // Extract data based on titles

    autoTable(doc, {
      theme: "grid",
      startY: 20,
      head: [titles.map((title) => title.header)], // Use title headers
      body: tableData,
    });

    doc.save("data.pdf");
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(content);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "data.xlsx");
  };

  return (
    <div className="w-full px-10">
      <h1 className="text-xl font-bold my-4">{title}</h1>
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead>
          <tr>
            {titles.map((title) => (
              <th key={title.key} className="border border-gray-300 p-2">
                {title.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.length > 0 ? (
            content.map((row, index) => (
              <tr key={index}>
                {titles.map((title) => (
                  <td key={title.key} className="border border-gray-300 p-2">
                    {row[title.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={titles.length} className="border border-gray-300 p-2 text-center">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="flex space-x-5 text-black items-center text-xl mt-5">
        <h1>Download</h1>
        <button
          onClick={exportToExcel}
          className="bg-green-700 hover:bg-green-400 border py-1 px-5 text-white text-base"
        >
          Export as .xlsx
        </button>
        <button
          onClick={exportToPdf}
          className="bg-green-700 hover:bg-green-400 border py-1 px-5 text-white text-base"
        >
          Export as .pdf
        </button>
      </div>
    </div>
  );
};

export default Table;
