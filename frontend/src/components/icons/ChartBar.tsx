import type { SVGProps } from "react";

const ChartBar = (props: SVGProps<SVGSVGElement>) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path d="M4 4v16h16" />
            <path d="M8 16v-4" />
            <path d="M13 16V8" />
            <path d="M18 16v-6" />
        </svg>
    )
}

export default ChartBar
