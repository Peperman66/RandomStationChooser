import { NextApiRequest, NextApiResponse } from "next";
import { StationData } from "../../../types/stationData";
import { GetRandomStation } from "../../../server/stationOsmHandler";

export default async function handler(req: NextApiRequest, res: NextApiResponse<StationData>) {
  const stationData = await GetRandomStation()
  console.log(stationData)
  res.json(stationData)
}