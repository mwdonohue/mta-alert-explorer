import { incident_lookup } from '../const'
import { Alert } from '../types/Alert'

function getTags(message: string): Array<string> {
  let retArray = []
  for (let textToFind of Object.keys(incident_lookup)) {
    if (message.includes(textToFind)) {
      retArray.push(incident_lookup[textToFind])
    }
  }
  return retArray
}

export function getAlertsFromMTAData(data: any): Array<Alert> {
  if (data['entity']) {
    let newData = data['entity'].filter(
      (alert: { id: any; 'transit_realtime.mercury_alert': any }) => alert.id.includes('alert'),
    )
    let innerAlerts: Array<Alert> = []
    newData.forEach((element: any) => {
      let a: Alert = {
        _id: null,
        id: element.id,
        start_time: new Date(element['alert']['active_period'][0]['start'] * 1000),
        end_time:
          element['alert']['active_period'][0]['end'] === undefined
            ? null
            : new Date(element['alert']['active_period'][0]['end'] * 1000),
        created_time: new Date(
          element['alert']['transit_realtime.mercury_alert']['created_at'] * 1000,
        ),
        updated_time: new Date(
          element['alert']['transit_realtime.mercury_alert']['updated_at'] * 1000,
        ),
        affected_services: element['alert']['informed_entity']
          .map((element: { [x: string]: any }) => {
            if ('route_id' in element) {
              return element['route_id']
            }
          })
          .filter((element: undefined) => element != undefined),
        affected_stops: element['alert']['informed_entity']
          .map((element: { [x: string]: any }) => {
            if ('stop_id' in element) {
              return element['stop_id']
            }
          })
          .filter((element: undefined) => element != undefined),
        type: getTags(element['alert']['header_text']['translation'][0]['text']),
        message: element['alert']['header_text']['translation'][0]['text'],
      }
      innerAlerts.push(a)
    })
    return innerAlerts
  }
}
