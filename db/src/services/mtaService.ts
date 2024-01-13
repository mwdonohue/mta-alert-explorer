import axios from 'axios'

export async function getMTAData(): Promise<any> {
  return axios
    .get('https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json', {
      headers: {
        'x-api-key': process.env.MTA_API_KEY,
      },
    })
    .then((resp) => resp.data)
}
