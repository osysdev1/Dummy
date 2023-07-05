const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const data = require("./data.json");
var http = require('http');
var server = http.createServer(app);

app.use(cors({ credentials: true, origin: "*" }));
app.use(
  express.json({ extended: true, limit: "50mb", type: "application/json" })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  bodyParser.json({ extended: true, limit: "50mb", type: "application/json" })
);
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());

app.get("/", (req, res) => {
  let { page, size, searchText } = req.query;
  let { pageConvert, sizeConvert } = generatePageSize(page, size);

  try {
    if (searchText) {
      let filterdata = data.filter(
        (d) =>
          d.ph.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
          d.agent.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      );
      if (filterdata.length > 0) {
        if (filterdata.length >= 10) {
          return res
            .status(200)
            .json(pagination(filterdata, pageConvert, sizeConvert));
        } else {
          return res.status(200).json(paginationLow(filterdata));
        }
      } else {
        return res.status(200).json(null);
      }
    } else {
      return res.status(200).json(pagination(data, pageConvert, sizeConvert));
    }
  } catch (error) {
    return res.status(400).json({ message: "Error" });
  }
});

function generatePageSize(page, size) {
  if (page) {
    if (parseInt(page) <= 1) {
      page = 1;
    } else {
      page = parseInt(page);
    }
  } else {
    page = 1;
  }

  if (size) {
    if (parseInt(size) <= 5) {
      size = 5;
    } else {
      size = parseInt(size);
      if (parseInt(size) >= 100) {
        size = 100;
      } else {
        size = parseInt(size);
      }
    }
  } else {
    size = 10;
  }

  let result = {
    pageConvert: page,
    sizeConvert: size,
  };

  return result;
}

function pagination(array, page, size) {
  let response = {
    totalItems: array.length,
    totalRows: Math.ceil(parseInt(array.length) / size),
    result: array.slice((page - 1) * size, page * size),
  };

  return response;
}

function paginationLow(array) {
  let response = {
    totalItems: array.length,
    totalRows: 1,
    result: array,
  };

  return response;
}

var port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("Server running at port " + port);
});
