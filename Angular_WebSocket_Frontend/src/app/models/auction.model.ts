export interface Property {
    id: string; // UUID
    title?: string;
    description?: string;
    location?: string;
    starting_price?: number;
    current_price?: number;
    created_at: Date;
    owner?: User;
    is_active: boolean;
}

export interface Bid {
    id: string; // UUID
    property: Property;
    user: User;
    bid_amount: number;
    bid_time: Date;
}

export interface Auction {
    id: string; // UUID
    property: string;
    start_time: Date;
    end_time: Date;
    reserve_price?: number;
}

export interface User {
    id: string; // UUID
    username: string;
    // Add other user fields as needed
}