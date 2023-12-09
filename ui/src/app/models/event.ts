import { Alert } from './alert';

export class Event {
  affected_services?: Array<string>;
  affected_stops?: Array<string>;
  alerts?: Array<Alert>;
  created_time?: number | Date;
  event_types?: Array<string>;
}
