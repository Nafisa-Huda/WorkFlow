import bcrypt from 'bcrypt'
import { Schema, model, type InferSchemaType } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

const SALT_ROUNDS = 12

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      ...toJSON,
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id
        delete ret.passwordHash
        return ret
      },
    },
    methods: {
      verifyPassword(password: string) {
        return bcrypt.compare(password, this.passwordHash)
      },
    },
    statics: {
      hashPassword(password: string) {
        return bcrypt.hash(password, SALT_ROUNDS)
      },
    },
  },
)

export type UserFields = InferSchemaType<typeof userSchema>
export const User = model('User', userSchema)
