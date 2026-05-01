'use client'

import { Message } from "@/model/User"
import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { acceptMessageSchema } from "@/schemas/acceptMessageSchemas"
import axios, { AxiosError } from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"
import MessageCard from "@/components/MessageCard"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCcw } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

const UserDashboard = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    const handleDeleteMessage = (messagesId: string) => {
        setMessages(messages.filter((message) => message._id.toString() !== messagesId))
    }

    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    })

    const { register, control, setValue } = form;

    const acceptMessages = useWatch({
        control,
        name: "acceptMessage"
    })

    const fetchAcceptMessaage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get('/api/accept-messages')
            setValue('acceptMessage', response.data.isAcceptingMessage)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast("Error", {
                description: axiosError.response?.data.message || "Failed to fetch message setting",
            })
        }
        finally {
            setIsSwitchLoading(false)
        }
    }, [setValue])

    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(true)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])
            if (refresh) {
                toast("Refreshed Messages", {
                    description: "Showing latest messages"
                })
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast("Error", {
                description: axiosError.response?.data.message || "Failed to fetch message setting",
            })
        }
        finally {
            setIsSwitchLoading(false)
            setIsLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() => {
        if (!session || !session.user) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMessages()
        fetchAcceptMessaage()
    }, [session, setValue, fetchAcceptMessaage, fetchMessages])

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: !acceptMessages
            })
            setValue('acceptMessage', !acceptMessages)
            toast("Success", {
                description: response.data.message,
            })
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast("Error", {
                description: axiosError.response?.data.message || "Failed to fetch message setting",
            })
        }
    }
    const username = session?.user?.username
    const profileUrl = `${window.location.origin}/${username}`

    const copyToClipBoard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast("Url Copied", {
            description: "Profile URL has been copied to clipboard"
        })
    }

    if (!session || !session.user) {
        return <div>Please login</div>
    }


    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipBoard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register('acceptMessage')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard
                            key={message._id.toString()}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );


}

export default UserDashboard
