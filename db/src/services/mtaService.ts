export async function getMTAData(): Promise<any> {
  const resp = await fetch(
    'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json',
    {
      headers: {
        'x-api-key': process.env.MTA_API_KEY,
      },
    },
  )
  return await resp.json()
}
