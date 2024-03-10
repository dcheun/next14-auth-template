'use client'

import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '../ui/button'

const Social = () => {
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get('callbackUrl')

  const handleClick = (provider: 'google' | 'github') => {
    signIn(provider, {
      callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  }

  return (
    <div className='flex w-full items-center gap-x-2'>
      <Button size='lg' className='w-full' variant='outline' onClick={() => {}}>
        <FcGoogle className='h-5 w-5' />
      </Button>
      <Button
        size='lg'
        className='w-full'
        variant='outline'
        onClick={() => handleClick('github')}
      >
        <FaGithub className='h-5 w-5' />
      </Button>
    </div>
  )
}

export default Social
