import type { SVGProps } from "react";

const Activity = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M2.5 12H7l2.5 6.5L14 4l2.5 8H21.5" />
        </svg>
    )
}

export default Activity
