import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'tech-blue'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // 从localStorage读取保存的主题，默认为'tech-blue'
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('math-mistake-ai-theme') as Theme
    return savedTheme || 'tech-blue'
  })

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('math-mistake-ai-theme', newTheme)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'tech-blue' : 'light')
  }

  useEffect(() => {
    const root = document.documentElement

    // 移除所有主题类
    root.classList.remove('light', 'dark', 'tech-blue')

    // 添加当前主题类
    root.classList.add(theme)

    // 对于tech-blue主题，同时添加dark类以激活Tailwind的dark:变体
    if (theme === 'tech-blue' || theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // 根据主题设置data-theme属性
    root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}