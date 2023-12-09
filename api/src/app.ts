import express, { Express, Request, Response } from 'express'
import 'dotenv/config'
import { MongoClient, ServerApiVersion } from 'mongodb'
import 'lodash'
import _, { groupBy, difference, indexOf } from 'lodash'
import bodyParser from 'body-parser'

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
    if (Object.keys(req.query).length === 0) {
      let events = (await client
        .db('mtadb')
        .collection<Event>('Events')
        .find({
          created_time: { $gte: startDate, $lte: endDate },
          affected_services: { $in: selectedServices },
          event_types: { $in: selectedTypes },
          affected_stops: { $in: selectedStops },
        })
        .sort({ created_time: -1 })
        .toArray()) as Event[]
      res.json(events)
    } else {
      const groupTypeMap = {
        service: '$affected_services',
        event_type: '$event_types',
        stop: '$affected_stops',
        time: '$created_time',
      }
      let groupType = req.query.groupBy as string
      let result: any
      if (groupType === 'time') {
        let of = req.query.of as string
        let time_map = {
          'hour,day': '$hour',
          'day,week': '$dayOfWeek',
          'day,month': '$dayOfMonth',
          'week,year': '$week',
          'month,year': '$month',
        }
        result = await client
          .db('mtadb')
          .collection<Event>('Events')
          .aggregate([
            {
              $match: {
                created_time: { $gte: startDate, $lte: endDate },
                affected_services: { $in: selectedServices },
                event_types: { $in: selectedTypes },
                affected_stops: { $in: selectedStops },
              },
            },
            {
              $group: {
                _id: {
                  [time_map[of]]: { date: '$created_time', timezone: 'America/New_York' },
                },
                count: {
                  $sum: 1,
                },
                events: {
                  $push: '$$ROOT',
                },
              },
            },
            {
              $sort: {
                _id: 1,
              },
            },
          ])
          .toArray()
      } else {
        result = await client
          .db('mtadb')
          .collection<Event>('Events')
          .aggregate([
            {
              $match: {
                created_time: { $gte: startDate, $lte: endDate },
                affected_services: { $in: selectedServices },
                event_types: { $in: selectedTypes },
                affected_stops: { $in: selectedStops },
              },
            },
            {
              $unwind: groupTypeMap[groupType],
            },
            {
              $group: {
                _id: groupTypeMap[groupType],
                count: { $count: {} },
                events: { $push: '$$ROOT' },
              },
            },
            {
              $sort: {
                count: -1,
              },
            },
          ])
          .toArray()
      }

      res.json(result)
    }
  } finally {
    await client.close()
  }
})

app.get('/timebyhour', async (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', '*')
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      // strict: true,
      deprecationErrors: true,
    },
  })

  await client.connect()

  let events = await client
    .db('mtadb')
    .collection<Event>('Events')
    .aggregate([
      {
        $group: {
          _id: {
            $dayOfWeek: '$created_time',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ])
    .toArray()
  res.json(events)
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
    res.json(await client.db('mtadb').collection<Event>('Events').distinct('event_types'))
  } finally {
    await client.close()
  }
})

app.listen(3000, () => {
  console.log(`Server is running at http://localhost:3000`)
})

class Event {
  affected_services: Array<string>
  affected_stops: Array<string>
  alerts: Array<Alert>
  created_time: number | Date
  event_types: Array<string>
}

class Alert {
  id: string
  start_time: Date
  end_time: Date
  created_time: Date
  updated_time: Date
  affected_services: Array<string>
  affected_stops: Array<string>
  type: string
  message: string

  constructor(
    id: string,
    start_time: Date,
    end_time: Date,
    created_time: Date,
    updated_time: Date,
    affected_services: Array<string>,
    affected_stops: Array<string>,
    type: string,
    message: string,
  ) {
    this.id = id
    this.start_time = start_time
    this.end_time = end_time
    this.created_time = created_time
    this.updated_time = updated_time
    this.affected_services = affected_services
    this.affected_stops = affected_stops
    this.type = type
    this.message = message
  }
}
