import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";


const UsernameQuerySchemas = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()
    // localhost:3000/api/check-username-unique?username=abc?phone=android
    try {
        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }
        // validate with zod
        const result = UsernameQuerySchemas.safeParse(queryParams)
        console.log(result)  //TODO: REMOVE
        if (!result.success) {
            const tree = z.treeifyError(result.error);
            const usernameErrors = tree.properties?.username?.errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid query parameters",
            }, { status: 400 })
        }
        const { username } = result.data
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message: "Username is available",
        }, { status: 200 })
    } catch (error) {
        console.log("Error cheking username", error)
        return Response.json({
            success: false,
            message: "Error checking Username"
        },
            { status: 500 })
    }
}
