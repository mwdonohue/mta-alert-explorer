import { MongoClient, ServerApiVersion } from 'mongodb'
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler'
import 'dotenv/config'
import 'lodash'
import { getAlertsFromMTAData } from './services/alertService'
import { getMTAData } from './services/mtaService'
import { updateEvents } from './services/eventService'

// Make sure env variables are there
if (!process.env.DB_CONNECTION_STRING || !process.env.MTA_API_KEY) {
  console.log('Secrets not provided, exiting now')
  process.exit(1)
}
// Setup scheduler
const scheduler = new ToadScheduler()

// Define db client
const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

// Define task
const task = new AsyncTask('pollMTA', async () => {
  let mtaData = await getMTAData()
  let alerts = getAlertsFromMTAData(mtaData)
  await updateEvents(client, alerts)
})
// Define job
const job = new SimpleIntervalJob({ seconds: 15, runImmediately: true }, task, {
  preventOverrun: true,
})
// Execute task every 15 seconds
scheduler.addSimpleIntervalJob(job)

// Handle exit
process.on('SIGINT', async () => {
  scheduler.stop()
  await client.close()
  console.log('Terminated')
  process.exit(1)
})
