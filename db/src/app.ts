import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler'
import 'dotenv/config'
import 'lodash'
import { isEqual } from 'lodash'
import { incident_lookup } from './const'
import BaseAlert from '../../common/dist/types/alert'
import Event from '../../common/dist/types/event'

class Alert extends BaseAlert {
  _id: ObjectId
}

const uri = process.env.DB_CONNECTION_STRING

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

const scheduler = new ToadScheduler()

function getTags(message: string): Array<string> {
  let retArray = []
  for (let textToFind of Object.keys(incident_lookup)) {
    if (message.includes(textToFind)) {
      retArray.push(incident_lookup[textToFind])
    }
  }
  return retArray
}
const task = new AsyncTask('pollMTA', async () => {
  let data = await fetch(
    'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json',
    {
      headers: {
        'x-api-key': process.env.MTA_API_KEY,
      },
    },
  ).then((resp) => resp.json())
  if (data['entity']) {
    let newData = data['entity'].filter(
      (alert: { id: any; 'transit_realtime.mercury_alert': any }) => alert.id.includes('alert'),
    )
    let innerAlerts: Array<Alert> = []
    newData.forEach((element: any) => {
      let a: Alert = new Alert(
        element.id,
        new Date(element['alert']['active_period'][0]['start'] * 1000),
        element['alert']['active_period'][0]['end'] === undefined
          ? null
          : new Date(element['alert']['active_period'][0]['end'] * 1000),
        new Date(element['alert']['transit_realtime.mercury_alert']['created_at'] * 1000),
        new Date(element['alert']['transit_realtime.mercury_alert']['updated_at'] * 1000),
        element['alert']['informed_entity']
          .map((element: { [x: string]: any }) => {
            if ('route_id' in element) {
              return element['route_id']
            }
          })
          .filter((element: undefined) => element != undefined),
        element['alert']['informed_entity']
          .map((element: { [x: string]: any }) => {
            if ('stop_id' in element) {
              return element['stop_id']
            }
          })
          .filter((element: undefined) => element != undefined),
        getTags(element['alert']['header_text']['translation'][0]['text']),
        element['alert']['header_text']['translation'][0]['text'],
      )
      innerAlerts.push(a)
    })
    let alerts = innerAlerts
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

        // If there exists an event with the alert's created time, update the corresponding fields
        if (existingEvent) {
          let oldCopy = structuredClone(existingEvent)
          // Add alert to alert list (or update if it's already there)
          let currentAlertList = existingEvent.alerts
          let foundAlert = currentAlertList.findIndex((innerAlert) => innerAlert.id === alert.id)
          if (foundAlert > -1) {
            currentAlertList[foundAlert] = alert
          } else {
            currentAlertList.push(alert)
          }
          existingEvent.alerts = currentAlertList
          // Add affected stops from alert to event's affected stops
          let currentStops = new Set(existingEvent.affected_stops)
          for (let alertStop of alert.affected_stops) {
            currentStops.add(alertStop)
          }
          existingEvent.affected_stops = Array.from(currentStops)
          // Add affected services from alert to event's affected services
          let currentServices = new Set(existingEvent.affected_services)
          for (let alertService of alert.affected_services) {
            currentServices.add(alertService)
          }
          existingEvent.affected_services = Array.from(currentServices)
          // Get tags associated with alert, add those to event's tag list if they aren't there already
          let currentTags = new Set(existingEvent.event_types)
          for (let alertTag of alert.type) {
            currentTags.add(alertTag)
          }
          existingEvent.event_types = Array.from(currentTags)
          if (!isEqual(existingEvent, oldCopy)) {
            await eventSchema.replaceOne(
              { created_time: existingEvent.created_time },
              existingEvent,
            )
            console.log(`Updated event`)
          }
        } else {
          let e = new Event()
          e.created_time = alert.created_time
          e.alerts = [alert]
          e.affected_services = alert.affected_services
          e.affected_stops = alert.affected_stops
          e.event_types = alert.type
          await eventSchema.insertOne(e)
          console.log(`Added event`)
        }
      } finally {
        await client.close()
      }
    }
  }
})

const job = new SimpleIntervalJob({ seconds: 15, runImmediately: true }, task, {
  preventOverrun: true,
})

async function run() {
  try {
    if (!process.env.DB_CONNECTION_STRING || !process.env.MTA_API_KEY) {
      console.log('Secrets not provided, exiting now')
      process.exit(1)
    }
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    // await client.db('mtadb').collection('Events').deleteMany({})
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}
run().then(() => {
  scheduler.addSimpleIntervalJob(job)
})
process.on('SIGINT', () => {
  scheduler.stop()
  console.log('Terminated')
  process.exit(1)
})
