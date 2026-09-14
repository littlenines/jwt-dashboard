import type { SVGProps } from "react";

const UserX = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M15.5 21v-2a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="m17 8 5 5" />
            <path d="m22 8-5 5" />
        </svg>
    )
}

export default UserX
