export type UrgencyLevel = "HIGH" | "MEDIUM" | "LOW";
export type TicketStatus = "OPEN" | "CLOSED";
export type TicketCategory = "BILLING" | "TECHNICAL" | "FEATURE_REQUEST";
export type UserType = "AGENT" | "CUSTOMER";
export type MessageStatus = "DRAFT" | "PUBLISHED";

export interface TicketMessage {
  id: number | string;
  ticketId?: number | string;
  ticket_id?: number;
  userType?: UserType;
  user_type?: UserType;
  status: MessageStatus;
  message: string;
  createdAt?: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  urgencyLevel: UrgencyLevel;
  category: TicketCategory;
  sentimentScore: number;
  status: TicketStatus;
  description: string;
  createdAt?: string;
  messages?: TicketMessage[];
}
