const express = require('express');
const bodyParser = require('body-parser');
const socketIo = require("socket.io");
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const port = 5000;
const app = express()

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Recommendation searching API",
      description: "Search product recommendations by name",
      contact: {
        name: "Perach",
        email: "perach13@gmail.com"
      },
      servers: [{url:"http://localhost:5000",description:"Development server"}]
    }
  },
  apis: ["src/routes/recommendationRoutes.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocs))

require("./routes/recommendationRoutes")(app);

app.listen(port, () => console.log(`Listening on port ${port}`));
