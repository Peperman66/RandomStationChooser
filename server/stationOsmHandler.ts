import { notDeepEqual } from 'assert'
import { existsSync, writeFile } from 'fs'
import { StationData } from '../types/stationData'
//@ts-ignore - osm-read has no types
const osmRead = require('osm-read')
let osmDataFile: string = '.\\osm_data\\praha-latest.osm.pbf'
let stations: {[name: string]: StationData} = {}

async function DownloadData() {
  const filePath = '.\\osm_data\\praha-latest.osm.pbf'
  const rawData = await fetch('http://download.openstreetmap.fr/extracts/europe/czech_republic/praha-latest.osm.pbf')
  const data = await rawData.arrayBuffer()
  console.log(data.byteLength)
  return new Promise<void>((resolve, reject) => {
    writeFile(filePath, new Int8Array(data), () => resolve())
    osmDataFile = filePath
  })
}

async function ParseData() {
  return new Promise<void>(resolve => {
    const newStations: {[name: string]: StationData} = {}
    const relations: any[] = []
    const nodes: {[id: number]: any} = {}
    osmRead.parse({
      filePath: osmDataFile,
      format: 'pbf',
      node: function(node: any) {
        if (node.tags.public_transport == 'stop_position' || node.tags.highway == 'bus_stop') {
          nodes[node.id as number] = node
        }
      },
      relation: function(relation: any) {
        if (relation.tags.public_transport === 'stop_area') {
          relations.push(relation)
        }
      },
      endDocument: function() {
        relations.forEach(relation => {
          const name = relation.tags.name
          for (const member of relation.members) {
            const memberData = nodes[member.ref]
            if (memberData != undefined) {
              console.log(memberData)
              const newStation = {
                name: name,
                coords: {
                  lat: memberData.lat,
                  lon: memberData.lon
                }
              }
              console.log(newStation)
              newStations[newStation.name] = newStation
              break;
            }
          }
        })
        stations = newStations
        resolve()
      }
    })
  })
}

function CheckFileExists(): boolean {
  return osmDataFile !== '' && existsSync(osmDataFile)
}

function GetStationsCount(): number {
  return Object.keys(stations).length
}

function CheckParsingDone(): boolean {
  return GetStationsCount() > 0
}

export async function GetRandomStation() {
  if (!CheckFileExists()) {
    await DownloadData()
  }
  if (!CheckParsingDone()) {
    await ParseData()
  }

  const stationCount = GetStationsCount()

  return stations[Object.keys(stations)[Math.floor(Math.random() * stationCount)]]
}