import { Request, Response, Router } from "express";
import { Template } from "../models/Template";


const templateRoutes = Router();

templateRoutes.get('/', async (req: Request, res: Response) => {
  const templates =  await Template.find().lean();

  return res.status(200).json(templates)
})

export default templateRoutes;