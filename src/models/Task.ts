import mongoose, { Schema, Document } from 'mongoose'

export interface ITask extends Document {
  userId: string
  title: string
  completed: boolean
  createdAt: Date
}

const TaskSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema)
