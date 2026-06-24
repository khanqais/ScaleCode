import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Problems — AlgoGrid',
  description: 'View and manage your organized collection of Data Structure and Algorithm problems.',
}

export default function ProblemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
