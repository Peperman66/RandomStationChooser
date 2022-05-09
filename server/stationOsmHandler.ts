import { StationData } from '../types/stationData'
import prisma from '../lib/prisma'

async function GetStationsCount(): Promise<number> {
  return await prisma.station.count()
}

export async function GetRandomStation(): Promise<StationData> {
  const stationCount = await GetStationsCount()
  const station = await prisma.station.findFirst({
    skip: Math.floor(Math.random() * stationCount)
  })

  return {
    name: station?.name || "",
    nodeId: station?.id || -1,
    coords: {
      lat: station?.lat || 0,
      lon: station?.lon || 0
    }
  }
}
