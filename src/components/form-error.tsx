import { AlertTriangle } from 'lucide-react'

interface FormErrorProps {
  message?: string
  href?: string
  hrefText?: string
}

const FormError = ({ message, href, hrefText }: FormErrorProps) => {
  if (!message) {
    return null
  }

  return (
    <div className='bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive'>
      <AlertTriangle className='h-4 w-4' />
      <p>{message}</p>
      {href && (
        <a href={href} className='underline ml-2'>
          {hrefText || href}
        </a>
      )}
    </div>
  )
}

export default FormError
