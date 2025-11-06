import mongoose, {Schema, Document, Model, Types} from "mongoose";

export interface IBlog extends Document {
    title: string;
    content: string;
    imageUrl?: string;
    author: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BlogSchema: Schema<IBlog> = new Schema<IBlog>(
    {
        title: {type: String, required: true},
        content: {type: String, required: true},
        imageUrl: {type: String},
        author: {
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true, index: true
        },
    }
);

export const Blog: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema);

export default Blog;