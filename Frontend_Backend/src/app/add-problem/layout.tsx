import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Add Problem — AlgoGrid',
  description: 'Add a new Data Structure and Algorithm problem to your practice grid.',
}

export default function AddProblemLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
