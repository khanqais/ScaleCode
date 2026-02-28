/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@monaco-editor/react' {
  import type { ComponentType } from 'react'
  const Editor: ComponentType<Record<string, any>>
  export default Editor
}
