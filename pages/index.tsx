import type { NextPage } from 'next'
import { FC, useState } from 'react'
import { Map, Marker, MarkerLayer, MouseControl, POILayer, SyncControl } from 'react-mapycz'
import { StationData } from '../types/stationData'

const Home: NextPage = () => {
  const [station, setStationData] = useState<StationData>()
  const [inProgress, setInProgress] = useState<boolean>(false)
  const center = {lat: station?.coords.lat || 0, lng: station?.coords.lon || 0}

  const getRandomStation = () => {
    setInProgress(true)
    fetch("/api/station/getrandomdata")
    .then(raw => raw.json())
    .then(data => {
      setStationData(data)
      setInProgress(false)
    })
  }

  const getMapUrl = (): string => {
    return `https://mapy.cz/zakladni?x=${station?.coords.lon}&y=${station?.coords.lat}&z=16`
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

const CustomMap: FC<{center: {lat: number, lng: number}}> = (props: {center: {lat: number, lng: number}}) => {
  return (<>
    <Map zoom={17} center={props.center} height={"700px"} width={"1200px"} loaderApiConfig={{poi: true}}>
      <MouseControl zoom={true} pan={true} wheel={true}/>
      <POILayer id="poiLayer"/>
      <SyncControl />
    </Map>
  </>)
}

export default Home
