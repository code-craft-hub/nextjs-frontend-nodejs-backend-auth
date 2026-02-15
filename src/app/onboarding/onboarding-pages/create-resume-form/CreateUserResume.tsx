import React from 'react'
import ExperienceForm from './WorkExperienceForm'
import SkillsForm from './SkillsForm'
import EducationSection from './EducationSection'

const CreateUserResume = () => {
  return (
    <div>
      <ExperienceForm />
      <SkillsForm />
      <EducationSection />
      <ProjectCardSection />
      <CertificationAchievementsForm />

    </div>
  )
}

export default CreateUserResume
