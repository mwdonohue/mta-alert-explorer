interface Alert {
    id: string
    start_time: Date
    end_time: Date
    created_time: Date
    updated_time: Date
    affected_services: Array<string>
    affected_stops: Array<string>
    type: Array<string>
    message: string
  }

export default Alert;