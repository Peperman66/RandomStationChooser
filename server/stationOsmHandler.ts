import { StationData } from '../types/stationData'
//@ts-ignore - osm-read has no types
const parseOsm = require('osm-pbf-parser')
import through from 'through2'
import fetch from 'node-fetch'
let stations: {[name: string]: StationData} = {}

function ParseData() {
  const newStations: {[name: string]: StationData} = {}
  const relations: any[] = []
  const nodes: {[id: number]: any} = {}
  const osm = parseOsm()
  return fetch('http://download.openstreetmap.fr/extracts/europe/czech_republic/praha-latest.osm.pbf')
  .then(rawData => rawData.body)
  .then(data => data?.pipe(osm))
  .then(data => {
    console.log("Downloading OSM data...");
    return data.pipe(through.obj((items, enc, next) => {
      items.forEach((item: any) => {
        if (item.type === 'node') {
          if (item.tags.highway == 'bus_stop' || item.tags.railway == 'tram_stop' || item.tags.railway == 'halt' || item.tags.railway == 'station' || item.tags.railway == 'stop') {
            nodes[item.id as number] = item
          }
        } /*else if (item.type === 'relation') {
          //Not neded for now
          if (item.tags.public_transport === 'stop_area') {
            relations.push(item)
          }
        }*/
      })
      next()
    }))
  })
  .then(data => {
    return new Promise<void>((resolve) => {
      data.on('finish', () => {
        console.log("Parsing OSm data...")
        for (const nodeId of Object.keys(nodes)) {
          const node = nodes[parseInt(nodeId)]
          const name = node.tags.name as string
          const newStation = {
            name: name,
            coords: {
              lat: node.lat,
              lon: node.lon
            },
            nodeId: node.id
          }
          newStations[newStation.name] = newStation
        }
        stations = newStations
        console.log(`Parsing OSM data finished! Total stops: ${GetStationsCount()}`)
        resolve()
      })
    })
  })
}

function GetStationsCount(): number {
  return Object.keys(stations).length
}

function CheckParsingDone(): boolean {
  return GetStationsCount() > 0
}

export async function GetRandomStation() {
  if (!CheckParsingDone()) {
    await ParseData()
  }

  const stationCount = GetStationsCount()

  console.log(stationCount)
  return stations[Object.keys(stations)[Math.floor(Math.random() * stationCount)]]
}