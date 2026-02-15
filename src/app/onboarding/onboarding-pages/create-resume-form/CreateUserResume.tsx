import ResumeFormLayout from "./ResumeFormLayout";

const CreateUserResume = (data: any /* TODO: CLAUSE PLEASE GET TYPE OF THE DATA FROM THE RESUMES AGGREGATE WHICH IS THE RESUMES AND ALL IT'S CHILDREN TABLES */) => {
  return <ResumeFormLayout data={data} />;
};

export default CreateUserResume;
