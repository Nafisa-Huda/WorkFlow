import { Schema, model } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

const focusSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', default: null },
    startedAt: { type: Date, required: true },
    durationSec: { type: Number, required: true, min: 1, max: 60 * 60 * 4 },
  },
  { timestamps: true, toJSON },
)

focusSessionSchema.index({ userId: 1, startedAt: -1 })

export const FocusSession = model('FocusSession', focusSessionSchema)
