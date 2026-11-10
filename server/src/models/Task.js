import { Schema, model } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

export const PRIORITIES = ['none', 'low', 'medium', 'high']

const taskSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, default: '', maxlength: 5000 },
    listId: { type: Schema.Types.ObjectId, ref: 'List', default: null }, // null means it goes to inbox
    priority: { type: String, enum: PRIORITIES, default: 'none' },
    // Calendar day ("YYYY-MM-DD"), not an instant. See lib/validation.js.
    dueDate: { type: String, default: null },
    // A time block on the user's day, set when a task is dragged onto the agenda.
    scheduledStart: { type: Date, default: null },
    scheduledEnd: { type: Date, default: null },
    completedAt: { type: Date, default: null }, // null = still open
  },
  { timestamps: true, toJSON },
)

// Checks that compare the scheduled start and end times. Runs before every save.
taskSchema.pre('validate', function () {
  const start = this.scheduledStart
  const end = this.scheduledEnd
  if (Boolean(start) !== Boolean(end)) {
    this.invalidate('scheduledEnd', 'scheduledStart and scheduledEnd must be set together')
  } else if (start && end && end <= start) {
    this.invalidate('scheduledEnd', 'scheduledEnd must be after scheduledStart')
  }
})

// Indexes match the app's main queries: "my open tasks by due date" and "my agenda for a day".
taskSchema.index({ userId: 1, completedAt: 1, dueDate: 1 })
taskSchema.index({ userId: 1, scheduledStart: 1 })

export const Task = model('Task', taskSchema)
