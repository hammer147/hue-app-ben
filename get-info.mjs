import fetch from 'node-fetch'
import https from 'https'
import * as dotenv from 'dotenv'
dotenv.config()

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

// const url = `https://${process.env.BRIDGE_IP_ADDRESS}/clip/v2/resource/device`
const url = `https://${process.env.BRIDGE_IP_ADDRESS}/clip/v2/resource/light`

const response = await fetch(url, {
  headers: { 'hue-application-key': process.env.HUE_APPLICATION_KEY },
  agent: httpsAgent
})

const data = await response.json()
console.log(data)
