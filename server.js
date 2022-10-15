const express = require("express");
const multer = require("multer");
const app = express();
const upload = multer();
const port = 3000;
app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

const { response } = require("express");
const AWS = require("aws-sdk");

const config = new AWS.Config({
  accessKeyId: "AKIASB7UN5FDSB6LS6I5",
  secretAccessKey: "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",
  region: "us-east-1",
});

AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "SinhVien";

app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      res.send("Inrenal server error");
    } else {
      return res.render("home", { listItem: data.Items });
    }
  });
});

app.post("/", upload.fields([]), (req, res) => {
  const { ma, ngaysinh, ten, phone } = req.body;
  const params = {
    TableName: tableName,
    Item: {
      // id: new Date().getTime() + "",
      id: ma,
      date_birth: ngaysinh,
      name: ten,
      phone: phone,
    },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
      res.send("Inrenal server error");
    } else {
      return res.redirect("/");
    }
  });
});

app.post("/delete", upload.fields([]), (req, res) => {
  const listItems = Object.keys(req.body);
  console.log(listItems);
  if (listItems == 0) {
    return res.redirect("/");
  }

  function onDeleteItem(index) {
    const params = {
      TableName: tableName,
      Key: {
        id: listItems[index],
      },
    };
    docClient.delete(params, (err, data) => {
      if (err) {
        console.log(err);
        res.send("Inrenal server error");
      } else {
        if (index > 0) {
          onDeleteItem(index - 1);
        } else {
          return res.redirect("/");
        }
      }
    });
  }

  onDeleteItem(listItems.length - 1);
});

app.get("/showEdit/:id", (req, res) => {
  const params = {
    TableName: tableName,
    Key: {
      id: req.params.id,
    },
  };

  docClient.get(params, (err, data) => {
    if (err) {
      res.send("Inrenal server error");
    } else {
      return res.render("itemUpdate", { item: data.Item });
    }
  });
});

app.post("/update", upload.fields([]), (req, res) => {
  const { ma, ngaysinh, ten, phone } = req.body;
  const params = {
    TableName: tableName,
    Item: {
      // id: new Date().getTime() + "",
      id: ma,
      date_birth: ngaysinh,
      name: ten,
      phone: phone,
    },
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
      res.send("Inrenal server error");
    } else {
      return res.redirect("/");
    }
  });
});

app.listen(port, () => {
  console.log("build succsess");
});
