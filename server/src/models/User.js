import bcrypt from 'bcrypt'
import { Schema, model } from 'mongoose'
import { toJSON } from '../lib/toJSON.js'

const SALT_ROUNDS = 12

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Only the bcrypt hash is stored, never the password itself.
    passwordHash: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      ...toJSON,
      transform: (_doc, ret) => {
        delete ret._id
        delete ret.passwordHash
        return ret
      },
    },
    methods: {
      verifyPassword(password) {
        return bcrypt.compare(password, this.passwordHash)
      },
    },
    statics: {
      hashPassword(password) {
        return bcrypt.hash(password, SALT_ROUNDS)
      },
    },
  },
)

export const User = model('User', userSchema)
