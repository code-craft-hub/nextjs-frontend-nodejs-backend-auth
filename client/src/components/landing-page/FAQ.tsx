import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  return (
    <section
      id="template"
      className="px-4 sm:px-8 w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden mb-8 md:mb-32"
    >
      <div className="">
        <div className="flex flex-col items-center text-center">
          <h2 className="section-title ">Frequently Asked Questions</h2>
          <p className="subtitle">
            Still have questions? Its okay, we anticipated that
          </p>
        </div>
        <div className="w-full  flex">
          <div className=" flex w-full">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  How does CVER AI tailor my resume to a specific job
                  description?
                </AccordionTrigger>
                <AccordionContent>
                  CVER AI analyzes the keywords, skills, and qualifications
                  mentioned in the job description and cross-references them
                  with the information on your resume. The system then optimizes
                  your resume by emphasizing relevant experiences and skills
                  that align with the job&apos;s requirements.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  Do I need to provide a job description for the tailoring
                  process?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, by tailoring your resume and cover letter to match the
                  specific job description, CVER AI helps you meet Applicant
                  Tracking Systems (ATS) criteria, increasing the likelihood of
                  your application being noticed by recruiters.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  How long does the tailoring process take?
                </AccordionTrigger>
                <AccordionContent>
                  The tailoring process typically takes a few seconds. Once the
                  job description is provided, CVER AI quickly analyzes it and
                  generates a personalized resume, cover letter or set of
                  interview questions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>
                  Will my personal information be secure on CVER AI?
                </AccordionTrigger>
                <AccordionContent>
                  CVER AI prioritizes user privacy and security. Your data is
                  encrypted and stored securely, ensuring that your personal
                  information remains confidential.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>
                  Can I make edits to the tailored documents?
                </AccordionTrigger>
                <AccordionContent>
                  Yes, CVER AI allows you to review and make any necessary
                  adjustments to the tailored documents before finalizing them
                  for submission.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>
                  Is there a limit to the number of resumes or cover letters I
                  can generate?
                </AccordionTrigger>
                <AccordionContent>
                  With the Free plan, you receive 5 credits daily that can be
                  used to generate resumes and cover letters, and interview
                  questions. For unlimited access, you can choose between the
                  Daily, Weekly or Monthly plan, which provides unlimited
                  resume, cover letter, and interview question generation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
