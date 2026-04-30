"use client"
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import Link from "next/link"
import * as z from "zod"
import { verifySchema } from '@/schemas/verifySchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"

function VerifyAccount() {
    const router = useRouter()
    const params = useParams<{ username: string }>()

    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema),
    })

    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            const response = await axios.post(`/api/verify-code`, {
                username: params.username,
                code: data.code
            })
            toast("Success", {
                description: response.data.message
            })
            router.replace('/sign-in')
        } catch (error) {
            console.error("Error in signup of user", error)
            const axiosError = error as AxiosError<ApiResponse>;
            toast("Signup failed", {
                description: axiosError.response?.data.message || "Something went wrong",
            })
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Mystry Message
                    </h1>
                    <h3 className="mb-4">
                        Verify Your Account
                    </h3>
                    <p className="mb-4">
                        Enter the verification code sent to you email
                    </p>
                </div>
                <div>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <Controller
                                name="code"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Verification Code
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            value={field.value ?? ''}
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Enter the verification code here"
                                            autoComplete="off"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Button type="submit">
                                Verify Account
                            </Button>
                        </FieldGroup>
                    </form>
                    <div className="text-center mt-4">
                        <p>
                            Already a member?{' '}
                            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyAccount