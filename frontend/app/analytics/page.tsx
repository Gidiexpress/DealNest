import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-green-500" />
                <h1 className="text-3xl font-bold">Analytics</h1>
            </div>
            <p className="text-gray-500">Track your performance and deal statistics.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholders */}
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-none shadow-sm h-64 flex items-center justify-center bg-white rounded-[1.5rem]">
                        <span className="text-gray-300">Chart Placeholder {i}</span>
                    </Card>
                ))}
            </div>
        </div>
    )
}
