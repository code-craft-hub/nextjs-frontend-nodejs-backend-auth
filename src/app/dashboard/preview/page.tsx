import React from 'react'
import Preview from './Preview'

const PreviewPage = async ({ searchParams }: any) => {
  const { coverLetterId ,resumeId } = await searchParams;
  return (
    <div className='p-4 sm:p-8'>
      <Preview
      coverLetterId={coverLetterId}
      resumeId={resumeId}
      />
    </div>
  )
}

export default PreviewPage
