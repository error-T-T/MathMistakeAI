import { InlineMath, BlockMath } from 'react-katex'

interface MathTextProps {
  text: string
  block?: boolean
}

const containsHanCharacters = (value: string) => /[\u4E00-\u9FFF]/.test(value)
const containsLatexSyntax = (value: string) => /\\[a-zA-Z]+|\\[(){}\[\]]|\$|\^|_/.test(value)

// Minimal math renderer that falls back to plain text if KaTeX fails
export const MathText = ({ text, block }: MathTextProps) => {
  const isBlock = block || text.includes('\\n') || text.includes('$$')
  
  // If text contains Chinese characters, we need to be careful.
  // If it also has LaTeX syntax, we should try to render it, but maybe split it?
  // For now, if it has Chinese but NO obvious LaTeX syntax, just render as text.
  const hasChinese = containsHanCharacters(text)
  const hasLatex = containsLatexSyntax(text)

  if (hasChinese && !hasLatex) {
    return <span>{text}</span>
  }

  // If it has both, we might still want to render it as text if the LaTeX part is minimal or ambiguous,
  // but let's try to be smarter. 
  // A common issue is passing "º∆À„..." to InlineMath which expects pure math.
  // If the text is NOT wrapped in $...$ or $$...$$, and contains Chinese, 
  // it's likely mixed content that needs parsing, or just text.
  // react-katex InlineMath expects the 'math' prop to be the LaTeX string.
  // If we pass "º∆À„ $x$", KaTeX tries to render "º∆À„ $x$" as math.
  
  // Simple heuristic: if it contains Chinese, only render if it looks like a pure formula 
  // (which is unlikely if it has Chinese) OR if we parse it.
  // Since we don't have a full parser here, let's fallback to text for mixed content
  // unless it is explicitly wrapped in delimiters which we can strip?
  // Actually, if the user passes "Calculate $x$", InlineMath("Calculate $x$") fails.
  // The user of MathText likely expects it to handle mixed text.
  // But InlineMath/BlockMath are for PURE math.
  
  // If the text contains $, we should probably split it.
  if (text.includes('$')) {
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return (
      <span>
        {parts.map((part, index) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            return <BlockMath key={index} math={part.slice(2, -2)} />
          } else if (part.startsWith('$') && part.endsWith('$')) {
            return <InlineMath key={index} math={part.slice(1, -1)} />
          } else {
            return <span key={index}>{part}</span>
          }
        })}
      </span>
    )
  }

  // If no $, but has latex syntax (like \frac), treat as math if no Chinese.
  // If has Chinese, treat as text.
  if (hasChinese) {
     return <span>{text}</span>
  }

  try {
    if (isBlock) {
      return <BlockMath math={text} />
    }
    return <InlineMath math={text} />
  } catch {
    return <span>{text}</span>
  }
}

export default MathText
