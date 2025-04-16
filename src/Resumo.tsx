import saveAs from "file-saver";
import * as XLSX from "xlsx";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface Props {
  attendance: Record<string, boolean>;
  names: string[];
}

export function Resumo({ attendance, names }: Props) {
  const presentes = names.filter((n) => attendance[n]);
  const faltantes = names.filter((n) => !attendance[n]);

  const exportToExcel = () => {
    const data = [
      { Tipo: "Presentes", Nome: "" },
      ...presentes.map((nome) => ({ Tipo: "Presente", Nome: nome })),
      { Tipo: "", Nome: "" },
      { Tipo: "Faltantes", Nome: "" },
      ...faltantes.map((nome) => ({ Tipo: "Faltante", Nome: nome })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "relatorio.xlsx");
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun("Relatório de Presença")],
              heading: "Heading1",
            }),
            new Paragraph(" "),
            new Paragraph("Presentes:"),
            ...presentes.map(
              (nome) =>
                new Paragraph({
                  children: [new TextRun(nome)],
                })
            ),
            new Paragraph(" "),
            new Paragraph("Faltantes:"),
            ...faltantes.map(
              (nome) =>
                new Paragraph({
                  children: [new TextRun(nome)],
                })
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, "relatorio.docx");
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Resumo</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={exportToExcel}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Exportar Excel
        </button>
        <button
          onClick={exportToWord}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Exportar Word
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Presentes ({presentes.length})</h3>
      <ul className="mb-4">
        {presentes.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mb-2">Faltantes ({faltantes.length})</h3>
      <ul>
        {faltantes.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  );
}
