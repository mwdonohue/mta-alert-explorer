import Alert from "./alert"

interface Event {
    affected_services: Array<string>
    affected_stops: Array<string>
    alerts: Array<Alert>
    created_time: Date
    event_types: Array<string>
  }

export default Event