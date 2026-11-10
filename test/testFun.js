const express = require("express");
const app = express();
app.use(express.json());


const prod = ["pen", "pencil", "eraser", "sharpener", "notebook"];

app.get("/products", (req, res) => {
    res.send(prod);
});

app.post("/products", (req, res, next) => {
    if (!req.body || !req.body.name) {
        const error = new Error("الرجاء إدخال اسم المنتج");
        error.statusCode = 400;
        return next(error);
    }
    const { name } = req.body || {};
    prod.push(name);
    res.send(prod);
});

function first(req, res, next) {
  next(new Error("خطأ للتجربة"));
}

function handleError(error, req, res, next) {
  res
    .status(error.statusCode || 500)
    .send(`وصل الخطأ: ${error.message}`);
}

app.get("/", first);
app.use(handleError);

app.listen(3001, () => {
  console.log("افتح http://localhost:3001");
});
