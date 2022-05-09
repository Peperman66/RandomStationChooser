import { Prisma, PrismaPromise, Station } from "@prisma/client"
//@ts-ignore - osm-read has no types
import parseOsm from 'osm-pbf-parser'
import through from 'through2'
import fetch from 'node-fetch'

import prisma from "../lib/prisma"

//When running this script, type: "module" must be set in package.json

const queries: PrismaPromise<Prisma.BatchPayload>[] = []
queries.push(prisma.station.deleteMany({}))

const newStations: Station[] = []
const nodes: {[id: number]: any} = {}
const osm = parseOsm()
fetch('http://download.openstreetmap.fr/extracts/europe/czech_republic/praha-latest.osm.pbf')
.then(rawData => rawData.body)
.then(data => data?.pipe(osm))
.then(data => {
  console.log("Downloading OSM data...");
  return data.pipe(through.obj((items, enc, next) => {
    items.forEach((item: any) => {
      if (item.type === 'node') {
        if (item.tags.highway == 'bus_stop' || item.tags.railway == 'tram_stop' || item.tags.railway == 'halt' || item.tags.railway == 'station' || item.tags.railway == 'stop' || item.tags.public_transport == 'platform') {
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
  return new Promise<Prisma.BatchPayload[]>((resolve) => {
    data.on('finish', () => {
      console.log("Parsing OSM data...")
      const usedNames: Set<string> = new Set()
      for (const nodeId of Object.keys(nodes)) {
        const node = nodes[parseInt(nodeId)]
        const name = node.tags.name
        if (!name) continue;
        if (usedNames.has(name)) continue;
        const newStation = {
          name: name,
          lat: node.lat,
          lon: node.lon,
          id: node.id
        }
        newStations.push(newStation)
        usedNames.add(name)
      }
      queries.push(prisma.station.createMany({data: newStations}))
      console.log(`Parsing OSM data finished! Total stops: ${newStations.length}. Uploading to database...`)
      resolve(prisma.$transaction(queries))
    })
  })
})
.then(() => {
  console.log("Uploading finished!")
})
