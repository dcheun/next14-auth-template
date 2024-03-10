'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { currentRole } from '@/lib/auth'

import { admin } from '@/actions/admin'
import RoleGate from '@/components/auth/role-gate'
import FormSuccess from '@/components/form-success'
import { Button } from '@/components/ui/button'
import { useCurrentRole } from '@/hooks/use-current-role'
import { UserRole } from '@prisma/client'
import { toast } from 'sonner'

const AdminPage = () => {
  const onApiRouteClick = async () => {
    const res = await fetch('/api/admin')
    if (res.ok) {
      toast.success('Allowed API route')
    } else {
      toast.error('Not allowed API route')
    }
  }

  const onServerActionClick = async () => {
    const res = await admin()
    console.log(res)
    if (res.success) {
      toast.success(res.success)
    }
    if (res.error) {
      toast.error(res.error)
    }
  }

  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-2xl font-semibold text-center'>🔑 Admin</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message='You are allowed to see this content' />
        </RoleGate>

        <div
          className='flex items-center justify-between rounded-lg p-3
          border shadow-md'
        >
          <p className='text-sm font-medium'>Admin only API route</p>

          <Button onClick={onApiRouteClick}>Click to test</Button>
        </div>

        <div
          className='flex items-center justify-between rounded-lg p-3
          border shadow-md'
        >
          <p className='text-sm font-medium'>Admin only Server action</p>

          <Button onClick={onServerActionClick}>Click to test</Button>
        </div>
      </CardContent>
    </Card>
  )
}

// const AdminPage = async () => {
//   const role = await currentRole()
//   return <div>Current role: {role}</div>
// }

export default AdminPage
