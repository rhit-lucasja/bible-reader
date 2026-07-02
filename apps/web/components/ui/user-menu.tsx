import { auth, signOut } from "@/auth";


export default async function UserMenu() {
    const session = await auth()

    return (
        <p>nyi</p>
    )
}