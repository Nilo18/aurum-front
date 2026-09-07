export type ClientType = 'PERSON' | 'ORGANIZATION';
export type EventStatus =
  | 'REQUESTED'
  | 'PLANNING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: ClientType;
}

export interface Event {
  id: number;
  clientId: number;
  eventType: string;
  date: string; // LocalDate: YYYY-MM-DD, without timezone conversion.
  totalCost: number | null;
  guestCount: number;
  location: string;
  notes: string;
  status: EventStatus;
}

export type NewClient = Omit<Client, 'id'>;
export type NewEvent = Omit<Event, 'id' | 'clientId'>;

// Local review data, not an assumed backend POST contract.
// Use the saved client's id as clientId when creating the event.
export interface EventRequestDraft {
  client: NewClient;
  event: NewEvent;
  menuItemIds: number[];
}
