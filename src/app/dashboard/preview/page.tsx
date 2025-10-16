import React from "react";
import Preview from "./Preview";

const PreviewPage = async ({ searchParams }: any) => {
  const { coverLetterId, resumeId, destinationEmail } = await searchParams;

  let email = "";

  try {
    email = destinationEmail.replace(/^["']|["']$/g, '');
  } catch (error) {
    console.warn("Failed to parse destinationEmail, using raw value.", error);
    email = destinationEmail;
  }

  console.log("Destination Email: ", email);
  return (
    <div className="p-4 sm:p-8">
      <Preview
        coverLetterId={coverLetterId}
        resumeId={resumeId}
        destinationEmail={destinationEmail}
      />
    </div>
  );
};

export default PreviewPage;
