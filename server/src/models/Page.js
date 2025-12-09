import mongoose from 'mongoose';

const BlockSchema = new mongoose.Schema({
  type: { type: String, required: true },
  props: { type: Object, default: {} }
}, { _id: false });

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  blocks: { type: [BlockSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.Page || mongoose.model('Page', PageSchema);
