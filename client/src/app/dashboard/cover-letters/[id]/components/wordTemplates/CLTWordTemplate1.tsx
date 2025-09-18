import React from "react";
import { Document, Packer, Paragraph, TextRun, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { LetterType } from "@/types";


export const CLTWordTemplate1 = ({
  children,
  allData,
}: {
  children: React.ReactNode;
  allData: LetterType | undefined;
}) => {
  const handleDownload = async () => {
    const parser = new DOMParser();
    const parsedDoc = parser.parseFromString(allData?.data!, "text/html");
    let processedData = parsedDoc.body.textContent!;
    const paragraphs = processedData.split(
      /(?<=\.\s)\n|\.\s{2,}(?=\S)|(?<=\.\s)(?=[A-Z])/g
    );
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${allData?.firstName}${" "}${allData?.lastName}`,
                  font: "Arial",
                  size: 48,
                  bold: true,
                  color: "#000000",
                }),
              ],
              spacing: { after: 200, before: 500 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${allData?.key}`,
                  font: "Arial",
                  size: 28,
                  color: "#666666",
                  allCaps: true,
                }),
              ],
              spacing: { after: 100 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${allData?.address} | ${allData?.phoneNumber}`,
                  font: "Arial",
                  size: 24,
                  color: "#666666",
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: `${allData?.email} | ${allData?.portfolio}`,
                  font: "Arial",
                  size: 24,
                  color: "#666666",
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${allData?.salutation},`,
                  font: "Arial",
                  size: 24,
                  color: "#666666",
                }),
              ],
              spacing: { after: 300 },
            }),
            ...paragraphs?.map(
              (text) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: text.trim(),
                      font: "Arial",
                      size: 24,
                      color: "#666666",
                    }),
                  ],
                  spacing: { after: 200 },
                })
            ),
            new Paragraph({
              children: [
                new TextRun({
                  text: `${allData?.firstName} ${" "}${allData?.lastName}.`,
                  font: "Arial",
                  size: 24,
                  color: "#666666",
                }),
              ],
            }),
            new Paragraph({ text: "", spacing: { after: 400 } }),
          ],
        },
      ],
    });
    const buffer = await Packer.toBlob(doc);
    saveAs(buffer, `${allData?.key}.docx`);
  };
  return <div onClick={handleDownload}>{children}</div>;
};

