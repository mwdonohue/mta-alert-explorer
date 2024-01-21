import express, { Express, Request, Response } from 'express'
import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb'
import 'lodash'
import { indexOf, intersection } from 'lodash'
import bodyParser from 'body-parser'
import Event from '../../common/dist/types/event'
import { incident_lookup } from './const'

const app: Express = express()
const uri = process.env.DB_CONNECTION_STRING

let bodyparser = bodyParser.json()
app.options('/events', (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.end()
})
app.post('/events', bodyparser, async (req: Request, res: Response) => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  res.set('Access-Control-Allow-Origin', '*')
  let body = req.body
  let startDate = new Date(body['startDate'])
  let endDate = new Date(body['endDate'])
  let selectedServices: any = body['services']
  let indexOfNullSelectedServices = indexOf(selectedServices, null)
  if (indexOfNullSelectedServices > -1) {
    selectedServices[indexOfNullSelectedServices] = []
  }
  let selectedTypes: any = body['types']
  let indexOfNullTypes = indexOf(selectedTypes, null)
  if (indexOfNullTypes > -1) {
    selectedTypes[indexOfNullTypes] = []
  }
  let selectedStops: any = body['stops']
  let indexOfNullStops = indexOf(selectedStops, null)
  if (indexOfNullStops > -1) {
    selectedStops[indexOfNullStops] = []
  }
  try {
    await client.connect()
    let events = (await client
      .db('mtadb')
      .collection<Event>('Events')
      .find({
        created_time: { $gte: startDate, $lte: endDate },
        affected_services: { $in: selectedServices },
        // event_types: { $in: selectedTypes },
        affected_stops: { $in: selectedStops },
      })
      .sort({ created_time: -1 })
      .toArray()) as Event[]

    // Would be nice to dynamically assign event types so I can easily update them later without modifying the DB
    // If this causes performance issues, I'll go back to the DB way and probably write a script to update tags there

    // Assign type to each alert in the event
    events.forEach((event) => {
      event.alerts.forEach((alert) => {
        alert.type = getTags(alert.message)
      })
    })
    // Aggregate types from alert -> event
    events.forEach((event) => {
      let typeSet = new Set<string>()
      event.alerts.forEach((alert) => {
        alert.type.forEach((element) => typeSet.add(element))
      })
      event.event_types = Array.from(typeSet)
    })
    // Filter out the events
    events = events.filter(
      (event) =>
        intersection(event.event_types, selectedTypes).length > 0 ||
        (event.event_types.length === 0 && selectedTypes.includes('Untagged')),
    )
    res.json(events)
  } finally {
    await client.close()
  }
})

app.get('/services', async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*')
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      // strict: true,
      deprecationErrors: true,
    },
  })

  try {
    res.json(await client.db('mtadb').collection<Event>('Events').distinct('affected_services'))
  } finally {
    await client.close()
  }
})

app.get('/stops', async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*')
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      // strict: true,
      deprecationErrors: true,
    },
  })

  try {
    res.json(await client.db('mtadb').collection<Event>('Events').distinct('affected_stops'))
  } finally {
    await client.close()
  }
})

app.get('/types', async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*')
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      // strict: true,
      deprecationErrors: true,
    },
  })

  try {
    let events = (await client.db('mtadb').collection<Event>('Events').find().toArray()) as Event[]
    let eventTypeSet = new Set<string>()

    // Aggregate all alert types
    events.forEach((event) => {
      event.alerts.forEach((alert) => {
        let type = getTags(alert.message)
        type.forEach((element) => eventTypeSet.add(element))
      })
    })

    res.json(Array.from(eventTypeSet).sort())
  } finally {
    await client.close()
  }
})

app.listen(3000, () => {
  if (!process.env.DB_CONNECTION_STRING) {
    console.log('Secrets not provided, exiting now')
    process.exit(1)
  }
  console.log(`Server is running at http://localhost:3000`)
})

function getTags(message: string): Array<string> {
  let retArray = []
  for (let textToFind of Object.keys(incident_lookup)) {
    if (message.toLowerCase().includes(textToFind.toLowerCase())) {
      retArray.push(incident_lookup[textToFind])
    }
  }
  return retArray
}
