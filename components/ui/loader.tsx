import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export default function Loader({ className }: { className?: string }) {
    return (
        <div className={cn("flex justify-center items-center w-full h-full min-h-[200px]", className)}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}
