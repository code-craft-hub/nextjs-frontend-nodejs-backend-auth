import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Pencil } from "lucide-react";

export default function ApplicationReview() {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-bold">
          a
        </div>
        <div>
          <h1 className="text-xl font-semibold">Software Engineer</h1>
          <p className="text-sm text-muted-foreground">Amazon · New York, NY · On-site</p>
        </div>
      </div>

      {/* Resume */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-medium">CV / Resume</h2>
          <div className="flex items-center justify-between border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 flex items-center justify-center rounded-lg text-xs font-bold">
                PDF
              </div>
              <div>
                <p className="text-sm font-medium">Sarah_Johnson_CV_Original.pdf</p>
                <p className="text-xs text-muted-foreground">Uploaded on March 15, 2024 · 2.4 MB</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Eye className="w-4 h-4" /> preview
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cover Letter */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-4">
          <h2 className="font-medium">Cover Letter</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dear Hiring Manager,
            <br /><br />
            I am writing to apply for the Software Developer position at your organization. With a strong foundation in backend development, database administration, and web technologies, I am confident in my ability to contribute meaningfully to your engineering team. I have hands-on experience working with Java, Python, JavaScript, HTML, and CSS, as well as backend development using PHP and Java. I am also experienced in working with MySQL databases and managing systems within development environments such as XAMPP. In my role as a database administrator, I have developed a solid understanding of data integrity, performance optimization, and system reliability...
          </p>
          <button className="text-sm text-blue-600 hover:underline">View more</button>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className="rounded-2xl">
        <CardContent className="p-5 space-y-6">
          <h2 className="font-medium">Application Questions & Answers</h2>

          {[1, 2, 3].map((q) => (
            <div key={q} className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium">
                  {q}. {getQuestion(q)}
                </p>
                <Button variant="ghost" size="icon">
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                I am writing to apply for the Software Developer position at your organization. With a strong foundation in backend development, database administration, and web technologies, I am confident in my ability to contribute meaningfully to your engineering team. I have hands-on experience working with Java, Python...
              </p>
              {q !== 3 && <Separator />}
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              Decline
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Turn off manual review</span>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Approve
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getQuestion(q: number) {
  switch (q) {
    case 1:
      return "Why are you interested in this role at amazon?";
    case 2:
      return "What relevant experience do you have for this role?";
    case 3:
      return "How do you handle stress and tight deadlines?";
    default:
      return "";
  }
}
