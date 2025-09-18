import React from "react";
import { Document, Packer, Paragraph, TextRun, UnderlineType } from "docx";
import { saveAs } from "file-saver";
import { QuestionType } from "@/types";

const IQ1WordTemplate = ({
  allData,
  children,
}: {
  children: React.ReactNode;
  allData: QuestionType | undefined;
}) => {
  const handleDownload = async () => {
    const doc = new Document({
      sections: [
        {
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: "JOB INTERVIEW QUESTIONS",
                  bold: true,
                  size: 48,
                  allCaps: true,
                }),
              ],
              alignment: "center",
              spacing: { after: 300 },
            }),

            // Subtitle
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    `Here are key questions and answers tailored for a/an ${allData?.key}.`,
                  size: 30,
                  font: "Arial",
                  underline: {
                    type: UnderlineType.SINGLE,
                  },
                }),
              ],
              alignment: "center",
              spacing: { after: 200 },
            }),

            // Main content that will be mapped
            ...(Array.isArray(allData?.data)
              ? allData?.data.flatMap((item) => {
                  const paragraphs:any = [];

                  // Map Questions
                  Object.keys(item)
                    .filter((key) => key.startsWith("Q"))
                    .forEach((_qKey) => {
                      paragraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Question: `,
                              font: "Arial",
                              bold: true,
                              size: 24,
                              // color: "#666666",
                            }),
                            new TextRun({
                              // text: item[qKey].toString(),
                              font: "Arial",
                              size: 24,
                              
                            }),
                          ],
                          spacing: { after: 300 },
                        })
                      );
                    });

                  // Map Answers
                  Object.keys(item)
                    .filter((key) => key.startsWith("A"))
                    .forEach((_aKey) => {
                      paragraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: `Answer: `,
                              font: "Arial",
                              bold: true,
                              size: 24,
                              // color: "#666666",
                            }),
                            new TextRun({
                              // text: item[aKey].toString(),
                              font: "Arial",
                              size: 24,
                              
                            }),
                          ],
                          spacing: { after: 300 },
                        })
                      );
                    });

                  return paragraphs;
                })
              : []),

            // Footer (optional)
            // new Paragraph({
            //   children: [
            //     new TextRun({
            //       text: "End of Interview Questions.",
            //       italics: true,
            //     }),
            //   ],
            //   alignment: "center",
            //   spacing: { before: 300 },
            // }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${allData?.key}.docx`);
  };

  return <div onClick={handleDownload}>{children}</div>;
};

export default IQ1WordTemplate;
