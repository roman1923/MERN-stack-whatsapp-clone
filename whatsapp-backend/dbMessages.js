import mongoose from 'mongoose';
//const { Schema } = mongoose;

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean,
});

export default mongoose.model('messagecontents', whatsappSchema)