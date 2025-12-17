import { AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import { Card, CardContent } from './ui/Card'

interface NoMistakeFallbackProps {
  title?: string
  description: string
  className?: string
}

const NoMistakeFallback = ({
  title = 'Î´ÕÒµ½´íÌâ',
  description,
  className,
}: NoMistakeFallbackProps) => (
  <Card className={cn('text-center py-12', className)}>
    <CardContent>
      <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </CardContent>
  </Card>
)

NoMistakeFallback.displayName = 'NoMistakeFallback'

export default NoMistakeFallback
