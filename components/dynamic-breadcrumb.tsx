"use client"

import { usePathname } from "next/navigation"
import React from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
    const pathname = usePathname()

    const segments = pathname.split("/").filter((item) => item !== "")

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Sarpras</BreadcrumbLink>
                </BreadcrumbItem>
                {segments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}

                {segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    const href = `/${segments.slice(0, index + 1).join("/")}`
                    const title = capitalize(segment.replace(/-/g, " "))

                    return (
                        <React.Fragment key={href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
