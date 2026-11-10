/**
 * Shared JSON shape for API responses: expose `id` instead of `_id`,
 * and drop internal fields the client never needs.
 */
export const toJSON = {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id
    delete ret.userId
    return ret
  },
}
