export class Alert {
  id: string;
  start_time: Date;
  end_time: Date;
  created_time: Date;
  updated_time: Date;
  affected_services: Array<string>;
  affected_stops: Array<string>;
  type: string;
  message: string;

  constructor(
    id: string,
    start_time: Date,
    end_time: Date,
    created_time: Date,
    updated_time: Date,
    affected_services: Array<string>,
    affected_stops: Array<string>,
    type: string,
    message: string
  ) {
    this.id = id;
    this.start_time = start_time;
    this.end_time = end_time;
    this.created_time = created_time;
    this.updated_time = updated_time;
    this.affected_services = affected_services;
    this.affected_stops = affected_stops;
    this.type = type;
    this.message = message;
  }
}
