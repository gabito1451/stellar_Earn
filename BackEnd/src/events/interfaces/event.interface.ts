export interface IEvent {
    id: string;
    type: string;
    payload: any;
    metadata?: any;
    timestamp: Date;
    version: number;
}
