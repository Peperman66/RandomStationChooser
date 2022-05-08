import { NextApiRequest, NextApiResponse } from "next";
import { StationData } from "../../../types/stationData";
import { GetRandomStation } from "../../../server/stationOsmHandler";

export default function handler(req: NextApiRequest, res: NextApiResponse<StationData>) {
  return GetRandomStation()
}