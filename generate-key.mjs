import fetch from 'node-fetch'
import https from 'https'
import * as dotenv from 'dotenv'
dotenv.config()

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

const body = {
  devicetype: process.env.APP_NAME,
  generateclientkey: true
}

const url = `https://${process.env.BRIDGE_IP_ADDRESS}/api`

const response = await fetch(url, {
  method: 'post',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  agent: httpsAgent
})

const data = await response.json()
console.log(data)
