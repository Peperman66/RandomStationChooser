import type { NextPage } from 'next'
import { useState } from 'react'
import { StationData } from '../types/stationData'

const Home: NextPage = () => {
  const [station, setStationData] = useState<StationData>()
  const getRandomStation = () => {
    fetch("/api/station/getrandomdata")
    .then(raw => raw.json())
    .then(data => {
      setStationData(data)
    })
  }
  return (
    <>
      <button onClick={getRandomStation}>Vybrat stanici</button>
      <span>Vybraná stanice:</span>
      <span>{station?.name}</span>
    </>
  )
}

export default Home
