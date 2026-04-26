export declare class CreateTicketDto {
    subject: string;
    message: string;
    category?: string;
}
export declare class ReplyTicketDto {
    adminReply: string;
    status?: string;
}
export declare class UpdateTicketStatusDto {
    status: string;
}
