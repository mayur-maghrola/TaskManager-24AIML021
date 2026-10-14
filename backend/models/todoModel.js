const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Task text is required"],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to ensure both text and title are populated
todoSchema.pre("save", function (next) {
  if (!this.title && this.text) {
    this.title = this.text;
  }
  if (!this.text && this.title) {
    this.text = this.title;
  }
  next();
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
