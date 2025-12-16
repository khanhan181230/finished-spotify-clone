import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {             //Clerk user ID
        type: String,
        required: true,
    },
    receiverId: {           //Clerk user ID
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    }
}, { timestamps: true }); //createdAt, updatedAt

export const Message = mongoose.model("Message", messageSchema);