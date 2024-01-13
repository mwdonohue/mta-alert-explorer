import { isEqual } from 'lodash'
import { Alert } from '../types/Alert'
import Event from '../../../common/dist/types/event'
import { MongoClient } from 'mongodb'

export async function updateEvents(client: MongoClient, alerts: Array<Alert>) {
  for (let alert1 of alerts) {
    const { ...alert } = alert1
    try {
      await client.connect()
      const db = client.db('mtadb')
      const eventSchema = db.collection<Event>('Events')
      let existingEvent = await eventSchema.findOne(
        { created_time: alert.created_time },
        { projection: { _id: 0 } },
      )

      if (existingEvent) {
        let oldCopy = structuredClone(existingEvent)
        // Add alert to alert list (or update if it's already there)
        let currentAlertList = structuredClone(existingEvent.alerts)
        let foundAlert = currentAlertList.findIndex((innerAlert) => innerAlert.id === alert.id)
        if (foundAlert > -1) {
          currentAlertList[foundAlert] = alert
        } else {
          currentAlertList.push(alert)
        }
        existingEvent.alerts = currentAlertList

        // Add affected stops from alert to event's affected stops
        existingEvent.affected_stops = [
          ...existingEvent.affected_stops,
          ...alert.affected_stops.filter((e) => !existingEvent.affected_stops.includes(e)),
        ]

        // Add affected services from alert to event's affected services
        existingEvent.affected_services = [
          ...existingEvent.affected_services,
          ...alert.affected_services.filter((e) => !existingEvent.affected_services.includes(e)),
        ]
        // Get tags associated with alert, add those to event's tag list if they aren't there already
        existingEvent.event_types = [
          ...existingEvent.event_types,
          ...alert.type.filter((e) => !existingEvent.event_types.includes(e)),
        ]

        if (!isEqual(existingEvent, oldCopy)) {
          await eventSchema.replaceOne({ created_time: existingEvent.created_time }, existingEvent)
          console.log(
            `Updated Event\nOld Event:\n${JSON.stringify(oldCopy)}\nNew Event:\n${JSON.stringify(
              existingEvent,
            )}\n`,
          )
        }
      } else {
        let e: Event = {
          created_time: alert.created_time,
          alerts: [alert],
          affected_services: alert.affected_services,
          affected_stops: alert.affected_stops,
          event_types: alert.type,
        }
        await eventSchema.insertOne(e)
        console.log(`Added event:\n${JSON.stringify(e)}\n`)
      }
    } finally {
      await client.close()
    }
  }
}
