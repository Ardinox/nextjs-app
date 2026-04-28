'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm} from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, { AxiosError } from 'axios'
import { ApiResponse } from "@/types/ApiResponse"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Loader2 } from "lucide-react"

const Page = () => {
  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const debounced = useDebounceCallback(setUsername, 300)

  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    }
  })
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUsernameMessage('');
        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`)

          setUsernameMessage(response.data.message)
        }
        catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Error checking username")
        }
        finally {
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsernameUnique()
  }, [username])

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data)
      toast("Succeess", {
        description: response.data.message
      })
      router.replace(`/verify/${username}`)
      setIsSubmitting(false)
    } catch (error) {
      console.error("Error in signup of user", error)
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message
      toast("Signup failed", {
        description: errorMessage,
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystry Message
          </h1>
          <p className="mb-4">
            Signup to start your anonymous adventure
          </p>
        </div>
        <div>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Username
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter a unique username"
                      autoComplete="off"
                    />
                    {isCheckingUsername && <Loader2 className="animate-spin"/>}
                    <p className={`text-sm ${usernameMessage==="Username is available"?'text-green-500': 'text-red-500'}`}>
                        {usernameMessage}
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter your Email"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter a Strong Password"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {
                  isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-2 w-4 animate-spin" /> Please Wait
                    </>
                  ) : ('signup')
                }
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

export default Page