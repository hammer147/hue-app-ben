import got from 'got'
import jsdom from 'jsdom'
import fetch from 'node-fetch'
import https from 'https'
import * as dotenv from 'dotenv'
dotenv.config()

/**
 * About web-scraping with got en jsdom:
 * ===================================
 * https://www.twilio.com/blog/web-scraping-and-parsing-html-in-node-js-with-jsdom
 */

/**
 * Info over de pagina die we scrapen:
 * ===================================
 * https://www.buienradar.nl/overbuienradar/gratis-weerdata
 * Op basis van de door u gewenste coördinaten (latitude en longitude) kunt u de neerslag tot twee uur vooruit ophalen in tekstvorm. 
 * De data wordt iedere 5 minuten geüpdatet. Op deze pagina kunt u de neerslag in tekst vinden. 
 * De waarde 0 geeft geen neerslag aan (droog), de waarde 255 geeft zware neerslag aan. 
 * Gebruik de volgende formule voor het omrekenen naar de neerslagintensiteit in de eenheid millimeter per uur (mm/u):
 * Neerslagintensiteit = 10^((waarde-109)/32)
 * Ter controle: een waarde van 77 is gelijk aan een neerslagintensiteit van 0,1 mm/u. 
 */


const { JSDOM } = jsdom
const url = `https://gpsgadget.buienradar.nl/data/raintext/?lat=${process.env.LAT}&lon=${process.env.LON}`
const response = await got(url)
const dom = new JSDOM(response.body)
const dataArray = dom.window.document.querySelector('body').textContent.split('\n')

// dataArray looks like this: ['099|12:15', '112|12:20', '108|12:25','113|12:30', '124|12:35', '110|12:40', ...]
// we want to know how much it will rain in the next 30 minutes
// let's sum up the first part (3 chars converted to an integer) of the first 6 strings in the array

const rainSum = dataArray.reduce((acc, val, idx) => {
  if (idx < 6) {
    return acc + parseInt(val.substring(0, 3))
  }
  return acc
}, 0)

// console.log({ rainSum })

let color

if (rainSum <= 0) {
  color = { xy: { x: 0.4, y: 0.45 } } // yellow (no rain in the next 30 minutes)
} else if (rainSum > 400) {
  color = { xy: { x: 0.2, y: 0.05 } } // purple (a lot of rain in the next 30 minutes)
} else {
  color = { xy: { x: 0.15, y: 0.2 } } // light blue (some rain in the next 30 minutes)
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

await fetch(`https://${process.env.BRIDGE_IP_ADDRESS}/clip/v2/resource/light/${process.env.LIGHT_2_ID}`, {
  method: 'put',
  body: JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
    'hue-application-key': process.env.HUE_APPLICATION_KEY
  },
  agent: httpsAgent
})

setTimeout(turnLightOff, 30 * 1000)

async function turnLightOff() {
  await fetch(`https://${process.env.BRIDGE_IP_ADDRESS}/clip/v2/resource/light/${process.env.LIGHT_2_ID}`, {
    method: 'put',
    body: JSON.stringify({ on: { on: false } }),
    headers: {
      'Content-Type': 'application/json',
      'hue-application-key': process.env.HUE_APPLICATION_KEY
    },
    agent: httpsAgent
  })
}
