import { Schema, model } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

export const LIST_COLORS = [
  'slate',
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink',
]

// Every new account starts with these lists.
const DEFAULT_LISTS = [
  { name: 'Personal', color: 'violet' },
  { name: 'Work', color: 'blue' },
  { name: 'School', color: 'amber' },
]

const listSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    color: { type: String, enum: LIST_COLORS, default: 'slate' },
  },
  { timestamps: true, toJSON },
)

export const List = model('List', listSchema)

export function createDefaultLists(userId) {
  return List.insertMany(DEFAULT_LISTS.map((list) => ({ ...list, userId })))
}
