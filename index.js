const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const hbs = require("hbs");

//connecting db
const dbConnect = require("./config/config.js");
dbConnect();

//logger
app.use(morgan("dev"));

// for not storing cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper("product", (val1, val2) => val1 * val2);
hbs.registerHelper("sum", (val1, val2) => val1 + val2);
hbs.registerHelper("lessThan", (val1, val2) => val1 < val2);
hbs.registerHelper("equal", (val1, val2) => val1 == val2);
hbs.registerHelper("arrayLength", (val) => val.length);

//setting view engine and giving the path of static pages
app.set("view engine", "hbs");
app.use(express.static(__dirname + '/public'));
app.use("/productDetails", express.static("public"));
app.use("/account", express.static("public"));

//express-session
app.use(
  session({ resave: true, saveUninitialized: true, secret: "my secret" })
);

//parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//parse cookies
app.use(cookieParser());

//linking the routes
app.use(userRoutes);
app.use("/admin", adminRoutes);

//listening to the port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`Server running in port: http://localhost:${PORT}`)
);
