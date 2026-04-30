"use client"

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

function Navbar() {
    const { data: session } = useSession()
    const user = session?.user
    return (
        <nav className='p-4 md:p-6 shadow-md'>
            <div className='w-full flex flex-col md:flex-row justify-between items-center'>
                <Link href="/" className="text-xl font-bold mb-4 md:mb-0">
                    Mystry Message
                </Link>

                {
                    session ? (
                        <>
                            <span className='mr-4'>Welcome, {user?.username || user?.email} </span>
                            <Button className='w-full md:w-auto' onClick={() => signOut()}>Logout</Button>
                        </>

                    ) : (
                        <Link href='/sign-in'>
                            <Button className='w-full md:w-auto'>Login</Button>
                        </Link>
                    )
                }

            </div>
        </nav>

    )
}

export default Navbar