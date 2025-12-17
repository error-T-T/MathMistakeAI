declare module 'react-katex' {
  import * as React from 'react'

  export interface KatexProps {
    math: string
    errorColor?: string
  }

  export class InlineMath extends React.Component<KatexProps> {}
  export class BlockMath extends React.Component<KatexProps> {}
}
