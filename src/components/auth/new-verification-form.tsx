'use client'

import { useSearchParams } from 'next/navigation'
import CardWrapper from './card-wrapper'

import { newVerification } from '@/actions/new-verification'
import { useCallback, useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import FormError from '../form-error'
import FormSuccess from '../form-success'

const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const searchParams = useSearchParams()

  const token = searchParams.get('token')

  const handleSubmit = useCallback(() => {
    // NOTE: In development mode, useEffect is fired twice resulting
    // in an 'Email verified' followed by an 'Invalid token' message.
    // This will not happen in production.
    if (success || error) {
      return
    }

    if (!token) {
      setError('Missing token')
      return
    }
    newVerification(token)
      .then(({ error, success }) => {
        setSuccess(success)
        setError(error)
      })
      .catch((err) => {
        setError('Something went wrong!')
      })
  }, [token, success, error])

  useEffect(() => {
    handleSubmit()
  }, [handleSubmit])

  return (
    <CardWrapper
      headerLabel='Confirm your email'
      backButtonLabel='Back to login'
      backButtonHref='/auth/login'
    >
      <div className='w-full flex justify-center items-center'>
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}
      </div>
    </CardWrapper>
  )
}

export default NewVerificationForm
