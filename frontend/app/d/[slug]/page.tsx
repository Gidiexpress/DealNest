import { Metadata } from "next"
import axios from "axios"
import PublicDealContent from "./_components/PublicDealContent"
import { notFound } from "next/navigation"

interface Props {
    params: Promise<{ slug: string }>
}

async function getDeal(slug: string) {
    try {
        // Use the internal/backend URL or the configured one
        const baseUrl = process.env.API_URL || "http://localhost:8000"
        const response = await axios.get(`${baseUrl}/api/d/${slug}/public/`)
        return response.data
    } catch (error) {
        return null
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const deal = await getDeal(slug)

    if (!deal) {
        return {
            title: "Deal Not Found",
        }
    }

    return {
        title: `${deal.title} | Secure Escrow Deal`,
        description: deal.description.substring(0, 160),
        openGraph: {
            title: deal.title,
            description: deal.description.substring(0, 160),
            type: "website",
            images: ["/og-image.jpg"],
        },
        twitter: {
            card: "summary_large_image",
            title: deal.title,
            description: deal.description.substring(0, 160),
        }
    }
}

export default async function Page({ params }: Props) {
    const { slug } = await params
    const deal = await getDeal(slug)

    if (!deal) {
        notFound()
    }

    return <PublicDealContent initialDeal={deal} slug={slug} />
}
