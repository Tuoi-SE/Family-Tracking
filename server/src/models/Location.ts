import { Schema, model, Document, Types } from 'mongoose';

// Interface for the GeoJSON Point
interface IPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Interface representing a Location document in MongoDB
export interface ILocation extends Document {
  userId: Types.ObjectId; // Reference to the 'trackable' user
  location: IPoint;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true, // Each trackable user has only one location document that gets updated
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
}, { timestamps: true });

// Create a 2dsphere index for efficient geospatial queries
LocationSchema.index({ location: '2dsphere' });

export const Location = model<ILocation>('Location', LocationSchema);
