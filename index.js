const dotenv = require("dotenv");
const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const OpenAI = require("openai");
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET");
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const API_KEY = process.env.OPENAI_API_KEY;
console.log("API KEY >>> ", API_KEY);

app.post("/executeQuery", async (req, res) => {
  try {
    console.log("req.body >>> ", req.body);

    const openai = new OpenAI({
      apiKey: API_KEY,
    });

    const userMessage = req.body.text ? req.body.text : "Default message";

    console.log("---userMessage:", userMessage);

    const response = await openai.chat.completions.create({
      model: "gpt-4-0613",
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.76,
      max_tokens: 1067,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    // Debugging: Inspect response and response.choices
    console.log("Response from OpenAI:", response);
    console.log("Choices from OpenAI:", response.choices);
    // Return the answer

    res.status(200).send({
      result:
        response.choices &&
        response.choices[0] &&
        response.choices[0].message.content
          ? response.choices[0].message.content.trim()
          : "Hej! Modellen kan inte svara just nu",
    });
  } catch (error) {
    console.log("********************************", error);
    res.status(500).send({
      result: "An error occurred while trying to contact the OpenAI API",
    });
  }
});

const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Server is running in PORT ${port}`);
});
