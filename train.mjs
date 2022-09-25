import fetch from 'node-fetch'
import https from 'https'
import * as dotenv from 'dotenv'
dotenv.config()

// note that this api will only work for trains in Belgium
const irailResponse = await fetch(`https://api.irail.be/connections/?from=${process.env.DEPARTURE_STATION}&to=${process.env.ARRIVAL_STATION}&format=json&lang=nl`)
const irailData = await irailResponse.json()

const myConnection = irailData.connection.find(conn => {
  return new Date(conn.departure.time * 1000).getMinutes() === parseInt(process.env.MINUTES_PAST_THE_HOUR) // scheduled departure time for the train we want to check
})

const { delay, canceled } = myConnection.departure

let color

if (delay === "0" && canceled === "0") {
  color = { xy: { x: 0.2058, y: 0.5153 } } // green
} else {
  color = { xy: { x: 0.675, y: 0.322 } } // red
}

// this agent allows us to send https requests to the hue bridge on local network 
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const body = {
  on: { on: true },
  dimming: { brightness: 100 },
  color,
}

const response = await fetch(`https://${process.env.BRIDGE_IP_ADDRESS}/clip/v2/resource/light/${process.env.LIGHT_1_ID}`, {
  method: 'put',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'hue-application-key': process.env.HUE_APPLICATION_KEY
  },
  agent: httpsAgent
})

// const data = await response.json()
// console.log(data)

setTimeout(turnLightOff, 30 * 1000)

async function turnLightOff() {
  await fetch(`https://${process.env.BRIDGE_IP_ADDRESS}/clip/v2/resource/light/${process.env.LIGHT_1_ID}`, {
    method: 'put',
    body: JSON.stringify({ on: { on: false } }),
    headers: {
      'Content-Type': 'application/json',
      'hue-application-key': process.env.HUE_APPLICATION_KEY
    },
    agent: httpsAgent
  })
}
