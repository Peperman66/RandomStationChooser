import { NextApiRequest, NextApiResponse } from "next";
import { stationData } from "../../../types/stationData";
import { GetRandomStation } from "../../../server/stationOsmHandler";

export default function handler(req: NextApiRequest, res: NextApiResponse<stationData>) {
  return GetRandomStation()
}