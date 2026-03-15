import { Router } from 'express'
import { recognizeSign } from '../controllers/signController.js'

export const signRouter = Router()

signRouter.post('/recognize-sign', recognizeSign)

