export interface User {
    id: number;
    username: string;
    email: string;
    avatar?: string;
    role?: string;
    balance: string;
    is_verified: boolean;
    kyc_status: string;
    is_staff?: boolean;
    is_superuser?: boolean;
}

export interface Deal {
    id: number;
    title: string;
    description: string;
    amount: number;
    status: 'created' | 'funded' | 'in_progress' | 'delivered' | 'completed' | 'disputed' | 'cancelled' | 'refunded';
    client: User;
    freelancer?: User;
    created_at: string;
    updated_at: string;
    deadline?: string;
    unique_shareable_url: string;
    revision_count: number;
    dispute_window_expires?: string;
    attachments?: Attachment[];
    links?: DealLink[];
    submissions?: DealSubmission[];
    fee_breakdown?: FeeBreakdown;
}

export interface FeeBreakdown {
    base_amount: number;
    client_fee: number;
    freelancer_fee: number;
    total_to_pay: number;
    total_to_receive: number;
    platform_revenue: number;
}

export interface Attachment {
    id: number;
    file: string;
    name: string;
    size: number;
    uploaded_at: string;
}

export interface DealLink {
    id: number;
    url: string;
    name: string;
}

export interface Message {
    id: number;
    user: User;
    message: string;
    files: any[];
    created_at: string;
    is_system?: boolean;
}

export interface DealSubmission {
    id: number;
    freelancer: User;
    links: { url: string; label: string }[];
    files: string[];
    notes: string;
    revision_round: number;
    created_at: string;
}

export interface JobType {
    id: number;
    name: string;
    slug: string;
}

export interface Notification {
    id: number;
    type: 'message' | 'deal_accepted' | 'deal_approved' | 'deal_delivered' | 'deal_funded' | 'dispute' | string;
    content: string;
    is_read: boolean;
    created_at: string;
    deal?: number;
}
