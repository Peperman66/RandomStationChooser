import type { NextPage } from 'next'
import { FC, useState } from 'react'
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
      <div className='flex flex-col items-center'>
        <h1 className="text-6xl pb-4">Výběr náhodné zastávky v Praze</h1>
        <hr className='border-black w-full border-2' />
        <button className={'bg-gray-300 rounded-lg border p-1 text-3xl mt-4' + (inProgress ? " text-gray-100" : "")} onClick={getRandomStation} disabled={inProgress}>{inProgress ? "Vybírám..." : "Vybrat zastávku"}</button>
        <span className='text-xl'>Vybraná zastávka:</span>
        <span className='font-bold text-2xl'>{station?.name}</span>
        {station != undefined && <>
          <a className='text-blue-700 underline' href={getMapUrl()} target="_blank">Odkaz na zastávku</a>
          <CustomMap center={center}/>
        </>}
      </div>
    </>
  )
}

export default Home
