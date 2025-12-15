import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

const alertVariants = cva(
  'relative w-full rounded-lg border p-4',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-midnight-900 border-gray-200 dark:border-midnight-700',
        destructive: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const iconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle,
  warning: AlertCircle,
  info: Info,
}

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  icon?: React.ReactNode
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, title, icon, children, ...props }, ref) => {
    const Icon = icon || iconMap[variant || 'default']

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5 mt-0.5" />
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h5 className={cn(
                'text-sm font-medium',
                variant === 'destructive' && 'text-red-800 dark:text-red-300',
                variant === 'success' && 'text-green-800 dark:text-green-300',
                variant === 'warning' && 'text-yellow-800 dark:text-yellow-300',
                variant === 'info' && 'text-blue-800 dark:text-blue-300',
                variant === 'default' && 'text-gray-800 dark:text-gray-300'
              )}>
                {title}
              </h5>
            )}
            <div className={cn(
              'text-sm',
              title && 'mt-1',
              variant === 'destructive' && 'text-red-700 dark:text-red-400',
              variant === 'success' && 'text-green-700 dark:text-green-400',
              variant === 'warning' && 'text-yellow-700 dark:text-yellow-400',
              variant === 'info' && 'text-blue-700 dark:text-blue-400',
              variant === 'default' && 'text-gray-700 dark:text-gray-400'
            )}>
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

export { Alert }