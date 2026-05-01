import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const sessionUser: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, { status: 401 });
    }

    try {
        const foundUser = await UserModel.findById(sessionUser._id);

        if (!foundUser) {
            return Response.json({
                success: false,
                message: "User not found"
            }, { status: 404 });
        }

        const messages = foundUser.messages || [];

        messages.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return Response.json({
            success: true,
            messages
        }, { status: 200 });

    } catch (error) {
        console.log("Error fetching messages", error);

        return Response.json({
            success: false,
            message: "Failed to fetch messages"
        }, { status: 500 });
    }
}