import { Card } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"

export default function CalendarPage() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold">Calendar</h1>
            </div>
            <p className="text-gray-500">Manage your deadlines and meetings.</p>

            <Card className="border-none shadow-sm min-h-[500px] flex items-center justify-center bg-white rounded-[1.5rem]">
                <div className="text-center text-gray-400">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Calendar Integration Coming Soon</p>
                </div>
            </Card>
        </div>
    )
}
