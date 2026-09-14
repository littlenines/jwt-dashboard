import type { SVGProps } from "react";

const Plus = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    )
}

export default Plus
