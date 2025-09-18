import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  WidthType,
  Table,
  TableCell,
  TableRow,
} from "docx";
import { saveAs } from "file-saver";
import { DBUserT } from "@/types";

export default function CL1WordTemplate({
  profileTitle,
  userDataDB,
  children
}: {
  userDataDB?: DBUserT;
  profileTitle?: string;
  children: React.ReactNode
}) {
  const generateDocument = () => {
    const doc = new Document({
      comments: {
        children: [
          {
            id: 1,
            children: [],
            initials: "cverai.com",
            author: "cverai.com",
            date: new Date(),
          },
        ],
      },
      creator: "cverai.com",
      description:
        "cverai.com - You can generate interview questions, cover letter and resume | cv for your job search here.",
      keywords: "cverai.com - resume - cv - interview question - cover letter",
      lastModifiedBy: "cverai.com",
      subject: "cverai.com - Resume | cv",
      title: "cverai.com",

      sections: [
        {
          properties: {
            page: {
              margin: {
                right: 720,
                left: 720,
                top: 720,
                bottom: 720,
              },
            },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${userDataDB?.firstName} ${userDataDB?.lastName}`,
                  bold: true,
                  size: 50,
                  characterSpacing: 50,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 100,
              },
              border: {
                top: {
                  color: "ffffff",
                  style: "single",
                },
                bottom: {
                  color: "ffffff",
                  style: "single",
                },
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: userDataDB?.cvJobTitle,
                  characterSpacing: 20,
                  size: 28,
                  allCaps: true,
                  color: "808080",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 100, before: 100 },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `📞 ${userDataDB?.phoneNumber} | 📧  ${userDataDB?.email} |  🏠 ${userDataDB?.address}.`,
                  font: "Segoe UI Emoji",
                  noProof: true,
                  size: 22,
                  //🌐 ${userDataDB?.portfolio} |
                }),
              ],
              border: {
                top: {
                  color: "ffffff",
                  space: 360,
                  style: "single",
                  size: 6,
                },
                bottom: {
                  color: "ffffff",
                  space: 360,
                  style: "single",
                  size: 6,
                },
              },
              shading: {
                fill: "#f8fafc",
              },
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 100,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  children: [
                    new TextRun({
                      text: "PROFESSIONAL SUMMARY",
                      font: "Arial",
                      size: 28,
                      bold: true,
                      characterSpacing: 30,
                      allCaps: true,
                      border: {
                        style: "single",
                        size: 6,
                        color: "#f8fafc",
                        space: 6,
                      },
                    }),
                  ],
                }),
              ],
              indent: {
                left: 360,
                right: 360,
              },
              spacing: {
                before: 500,
              },

              border: {
                top: {
                  color: "f8fafc",
                  space: 4,
                  style: "single",
                  size: 4,
                },
                bottom: {
                  color: "f8fafc",
                  space: 4,
                  style: "single",
                  size: 4,
                },
              },
              shading: {
                fill: "#f8fafc",
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: profileTitle,
                  font: "Arial",
                  size: 24,
                }),
              ],
              indent: {
                left: 360,
                right: 360,
              },
              spacing: {
                before: 200,
                after: 200,
              },
              border: {
                top: {
                  color: "ffffff",
                  space: 360,
                  style: "single",
                  size: 6,
                },
                bottom: {
                  color: "ffffff",
                  space: 360,
                  style: "single",
                  size: 6,
                },
              },
            }),

            new Table({
              columnWidths: [9505, 3505],
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: {
                        size: 8505,
                        type: WidthType.DXA,
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              children: [
                                new TextRun({
                                  text: "WORK EXPERIENCE",
                                  font: "Arial",
                                  bold: true,
                                  size: 28,
                                  characterSpacing: 30,
                                  allCaps: true,
                                  border: {
                                    style: "single",
                                    size: 6,
                                    color: "#f8fafc",
                                    space: 6,
                                  },
                                }),
                              ],
                            }),
                          ],
                          indent: {
                            left: 360,
                            right: 360,
                          },
                          border: {
                            top: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                            bottom: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                          },
                          shading: {
                            fill: "#f8fafc",
                          },
                        }),
                        ...(Array.isArray(userDataDB?.workExperiences)
                          ? userDataDB?.workExperiences?.flatMap(
                              ({
                                workDescription,
                                jobEnd,
                                jobStart,
                                companyName,
                                jobTitle,
                                location,
                                responsibilities,
                              }) => [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: jobTitle,
                                          font: "Arial",
                                          bold: true,
                                          characterSpacing: 28,
                                          size: 24,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                  spacing: {
                                    before: 360,
                                    after: 100,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: `${companyName} - ${location}.`,
                                          font: "Arial",
                                          size: 24,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },

                                  spacing: {
                                    after: 80,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: String(
                                            new Date(jobStart)
                                          ).substring(4, 15),
                                          font: "Arial",
                                          size: 20,
                                          italics: true,
                                        }),
                                        new TextRun({
                                          text: " ~ ",
                                          font: "Arial",
                                          size: 20,
                                          italics: true,
                                        }),
                                        new TextRun({
                                          text: String(
                                            new Date(jobEnd)
                                          ).substring(4, 15),
                                          font: "Arial",
                                          size: 20,
                                          italics: true,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                  spacing: {
                                    after: 160,
                                  },
                                }),

                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: "Responsibilities and achievements :",
                                          font: "Arial",
                                          bold: true,
                                          underline: { type: "single" },
                                          size: 20,
                                          noProof: true,
                                        }),
                                      ],
                                    }),
                                  ],
                                  spacing: {
                                    after: 80,
                                    before: 300,
                                  },
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: workDescription,
                                          font: "Arial",
                                          size: 24,
                                        }),
                                      ],
                                    }),
                                  ],
                                  spacing: {
                                    after: 80,
                                  },
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    ...(Array.isArray(responsibilities)
                                      ? responsibilities.flatMap((resp) => [
                                          new TextRun({
                                            text: `• ${resp}`,
                                            font: "Arial",
                                            size: 24,
                                          }),
                                          new TextRun({ break: 1 }),
                                        ])
                                      : [
                                          new TextRun({
                                            text:
                                              typeof responsibilities ===
                                              "string"
                                                ? responsibilities
                                                : "",
                                            font: "Arial",
                                            size: 24,
                                          }),
                                        ]),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                }),
                              ]
                            )
                          : []),
                      ],
                      borders: {
                        bottom: {
                          style: "nil",
                        },
                        top: {
                          style: "nil",
                        },
                        end: {
                          style: "nil",
                        },
                        right: {
                          style: "nil",
                        },
                        left: {
                          style: "nil",
                        },
                      },
                      margins: {
                        bottom: 100,
                        top: 100,
                        left: 100,
                        right: 100,
                      },
                    }),
                    new TableCell({
                      width: {
                        size: 3505,
                        type: WidthType.DXA,
                      },
                      borders: {
                        top: {
                          style: "nil",
                        },
                        bottom: {
                          style: "nil",
                        },
                        left: {
                          style: "single",
                          size: 10,
                          color: "#f8fafc",
                        },
                        right: {
                          style: "nil",
                        },
                        end: {
                          style: "nil",
                        },
                        start: {
                          style: "single",
                          size: 10,
                          color: "#f8fafc",
                        },
                      },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              children: [
                                new TextRun({
                                  text: "Soft SKILLS",
                                  font: "Arial",
                                  bold: true,
                                  size: 28,
                                  characterSpacing: 30,
                                  allCaps: true,
                                  border: {
                                    style: "single",
                                    size: 6,
                                    color: "#f8fafc",
                                    space: 6,
                                  },
                                }),
                              ],
                            }),
                          ],
                          indent: {
                            left: 360,
                            right: 360,
                          },
                          border: {
                            top: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                            bottom: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                          },
                          shading: {
                            fill: "#f8fafc",
                          },
                        }),

                        ...(Array.isArray(userDataDB?.softSkills)
                          ? userDataDB?.softSkills?.flatMap(({ label }) => [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    children: [
                                      new TextRun({
                                        text: `• ${label}`,
                                        font: "Arial",
                                        size: 24,
                                      }),
                                    ],
                                  }),
                                ],
                                indent: {
                                  left: 360,
                                  right: 360,
                                },
                                spacing: {
                                  before: 200,
                                },
                              }),
                            ])
                          : []),
                        new Paragraph({
                          children: [
                            new TextRun({
                              children: [
                                new TextRun({
                                  text: "HARD SKILLS",
                                  font: "Arial",
                                  bold: true,
                                  size: 28,
                                  characterSpacing: 30,
                                  allCaps: true,
                                  border: {
                                    style: "single",
                                    size: 6,
                                    color: "#f8fafc",
                                    space: 6,
                                  },
                                }),
                              ],
                            }),
                          ],
                          indent: {
                            left: 360,
                            right: 360,
                          },
                          border: {
                            top: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                            bottom: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                          },
                          spacing: {
                            before: 200,
                            after: 200,
                          },
                          shading: {
                            fill: "#f8fafc",
                          },
                        }),

                        ...(Array.isArray(userDataDB?.hardSkills)
                          ? userDataDB?.hardSkills?.flatMap(({ label }) => [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    children: [
                                      new TextRun({
                                        text: `• ${label}`,
                                        font: "Arial",
                                        size: 22,
                                      }),
                                    ],
                                  }),
                                ],
                                indent: {
                                  left: 360,
                                  right: 360,
                                },
                                spacing: {
                                  before: 80,
                                },
                              }),
                            ])
                          : []),

                        new Paragraph({
                          children: [
                            new TextRun({
                              children: [
                                new TextRun({
                                  text: "EDUCATION",
                                  font: "Arial",
                                  bold: true,
                                  size: 28,
                                  characterSpacing: 30,
                                  allCaps: true,
                                  border: {
                                    style: "single",
                                    size: 6,
                                    color: "#f8fafc",
                                    space: 6,
                                  },
                                }),
                              ],
                            }),
                          ],
                          indent: {
                            left: 360,
                            right: 360,
                          },
                          spacing: {
                            before: 200,
                          },
                          border: {
                            top: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                            bottom: {
                              color: "f8fafc",
                              space: 4,
                              style: "single",
                              size: 4,
                            },
                          },
                          shading: {
                            fill: "#f8fafc",
                          },
                        }),

                        ...(Array.isArray(userDataDB?.educations)
                          ? userDataDB?.educations?.flatMap(
                              ({
                                degree,
                                schoolLocation,
                                educationEnd,
                                schoolName,
                                educationStart,
                                fieldOfStudy,
                              }) => [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: `${degree}`,
                                          font: "Arial",
                                          size: 24,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                  spacing: {
                                    before: 180,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: `${fieldOfStudy}.`,
                                          font: "Arial",
                                          size: 24,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                  spacing: {
                                    before: 80,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: `${schoolName}, ${schoolLocation}.`,
                                          font: "Arial",
                                          size: 24,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                  spacing: {
                                    before: 80,
                                  },
                                }),
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      children: [
                                        new TextRun({
                                          text: `${String(
                                            new Date(educationStart)
                                          ).substring(4, 15)} ~ ${String(
                                            new Date(educationEnd)
                                          ).substring(4, 15)}`,
                                          font: "Arial",
                                          italics: true,
                                          size: 20,
                                        }),
                                      ],
                                    }),
                                  ],
                                  indent: {
                                    left: 360,
                                    right: 360,
                                  },
                                  spacing: {
                                    before: 80,
                                  },
                                }),
                              ]
                            )
                          : []),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${userDataDB?.firstName} resume`);
    });
  };

  return (
    <div onClick={generateDocument}>
      {children}
    </div>
  );
}
