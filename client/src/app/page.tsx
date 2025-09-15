import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div>
      <Link href="/register">Register</Link>
      <Link href="/login">Login</Link>
    </div>
  )
}

export default page
