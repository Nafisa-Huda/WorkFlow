import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

const eventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    notes: { type: String, default: '', maxlength: 5000 },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { timestamps: true, toJSON },
)

eventSchema.pre('validate', function (this: HydratedDocument<InferSchemaType<typeof eventSchema>>) {
  if (this.start && this.end && this.end <= this.start) {
    this.invalidate('end', 'end must be after start')
  }
})

eventSchema.index({ userId: 1, start: 1 })

export const Event = model('Event', eventSchema)
