import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

export const PRIORITIES = ['none', 'low', 'medium', 'high'] as const

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, default: '', maxlength: 5000 },
    listId: { type: Schema.Types.ObjectId, ref: 'List', default: null },
    priority: { type: String, enum: PRIORITIES, default: 'none' },
    // Calendar day ("YYYY-MM-DD"), not an instant. See lib/validation.ts.
    dueDate: { type: String, default: null },
    // A time block on the user's day, set when a task is dragged onto the agenda.
    scheduledStart: { type: Date, default: null },
    scheduledEnd: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON },
)

taskSchema.pre('validate', function (this: HydratedDocument<InferSchemaType<typeof taskSchema>>) {
  const { scheduledStart: start, scheduledEnd: end } = this
  if (!start !== !end) {
    this.invalidate('scheduledEnd', 'scheduledStart and scheduledEnd must be set together')
  } else if (start && end && end <= start) {
    this.invalidate('scheduledEnd', 'scheduledEnd must be after scheduledStart')
  }
})

taskSchema.index({ userId: 1, completedAt: 1, dueDate: 1 })
taskSchema.index({ userId: 1, scheduledStart: 1 })

export const Task = model('Task', taskSchema)
