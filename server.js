require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const helmet = require("helmet");
// const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const port = process.env.PORT || 5000;

const app = express();

// app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const mongoUri = process.env.MONGO_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .set("strictQuery", true)
  .connect(mongoUri, options)
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log(err));

const answerSchema = new mongoose.Schema({
  data: Object,
  date: { type: Date, default: Date.now },
});

const Answer = new mongoose.model("Answer", answerSchema);

app.post("/", (req, res) => {
  const filter = { "data.uuid": req.body.uuid };
  const update = {};
  for (const key of Object.keys(req.body)) {
    if (req.body[key] !== "") {
      update["data." + key] = req.body[key];
    }
  }

  Answer.findOneAndUpdate(filter, { $set: update }, { upsert: true, new: true })
    .then((doc) => res.send(doc))
    .catch((err) => console.log(err));
});

app.use(express.static("./client/build"));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

app.listen(port, function () {
  console.log("Express server launched...");
});
