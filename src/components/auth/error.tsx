import { AlertTriangle } from 'lucide-react'
import CardWrapper from './card-wrapper'

const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel='Oops! Something went wrong!'
      backButtonHref='/auth/login'
      backButtonLabel='Back to login &rarr;'
    >
      <div className='w-full flex justify-center items-center'>
        <AlertTriangle className='text-destructive' />
      </div>
    </CardWrapper>
  )
}

export default ErrorCard
