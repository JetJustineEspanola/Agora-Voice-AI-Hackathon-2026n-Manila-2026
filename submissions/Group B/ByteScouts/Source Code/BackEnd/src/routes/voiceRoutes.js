import { Router } from 'express'
import { startVoiceSession, speakVoiceSession, stopVoiceSession } from '../controllers/voiceController.js'

export const voiceRouter = Router()

voiceRouter.post('/voice/session/start', startVoiceSession)
voiceRouter.post('/voice/session/speak', speakVoiceSession)
voiceRouter.post('/voice/session/stop', stopVoiceSession)

