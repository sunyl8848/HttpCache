const express = require("express");
const path = require("path");
const fs = require("fs");
const etag = require("etag");

const PORT = 8800;
const app = express();

//app.use(express.static(path.join(__dirname, "public")));
// 强制缓存Expires
app.use("/expires.png", (req, res) => {
  let date = new Date();
  date.setMinutes(date.getMinutes() + 1);
  res.setHeader("Expires", date.toUTCString());
  
  const data = fs.readFileSync(path.join(__dirname, "/public/expires.png"));
  res.end(data);

  //res.sendFile(path.join(__dirname, "/public/expires.png"));
});
// 强制缓存max-age
app.use("/max_age.png", (req, res) => {
  res.setHeader("cache-control", "max-age=5");
  const data = fs.readFileSync(path.join(__dirname, "/public/max_age.png"));
  res.end(data);
});
// 协商缓存last-modified
app.use("/last_modified.png", (req, res) => {
  const state = fs.statSync(path.join(__dirname, "/public/last_modified.png"));
  const createTime = state.mtime.toUTCString();

  res.setHeader("last-modified", state.mtime.toUTCString());
  res.setHeader("Cache-Control", "no-cache");

  const ifModifiedSince = req.headers["if-modified-since"];

  if (ifModifiedSince) {
    if (createTime == ifModifiedSince) {
      console.log("last-modified cache");
      res.status(304).end(); // 协商缓存报304，但并不会报来自于内存
      return;
    }
  }
  const data = fs.readFileSync(path.join(__dirname, "/public/last_modified.png"));
  res.end(data);
});
// 协商缓存etag
app.use("/etag.png", (req, res) => {
  const data = fs.readFileSync(path.join(__dirname, "/public/etag.png"));

  const etagData = etag(data);
  console.log("etag:", etagData);
  res.setHeader("ETag", etagData);
  res.setHeader("Cache-Control", "no-cache");

  const ifNoneMatch = req.headers["if-none-match"];

  if (ifNoneMatch) {
    if (etagData == ifNoneMatch) {
      console.log("etag cache");
      res.status(304).end(); // 协商缓存报304，但并不会报来自于内存
      return;
    }
  }
  res.end(data);
});

app.use("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}.`);
});

// /*****************************************original http*********************************** */
// const http = require("http");
// const url = require("url");
// const fs = require("fs");
// const etag = require("etag");
// const PORT = 8800;

// http
//   .createServer((req, res) => {
//     console.log(req.method, req.url);
//     const { pathname } = url.parse(req.url);
//     if (pathname === "/") {
//       const data = fs.readFileSync("./public/index.html");
//       res.end(data);
//     }
//     // 强制缓存Expires
//     if (pathname === "/expires.png") {
//       const data = fs.readFileSync("./public/expires.png");
//       let date = new Date();
//       date.setMinutes(date.getMinutes() + 1);
//       res.setHeader("Expires", date.toUTCString());
//       res.end(data);
//     }
//     // 强制缓存max-age
//     if (pathname === "/max_age.png") {
//       const data = fs.readFileSync("./public/max_age.png");
//       res.setHeader("cache-control", "max-age=5");
//       res.end(data);
//     }
//     // 协商缓存last-modified
//     if (pathname === "/last_modified.png") {
//       const data = fs.readFileSync("./public/last_modified.png");

//       const state = fs.statSync("./public/last_modified.png");
//       const createTime = state.mtime.toUTCString();

//       res.setHeader("last-modified", state.mtime.toUTCString());
//       res.setHeader("Cache-Control", "no-cache");

//       const ifModifiedSince = req.headers["if-modified-since"];

//       if (ifModifiedSince) {
//         if (createTime == ifModifiedSince) {
//           console.log("last-modified cache");
//           res.statusCode = 304;
//           res.end(); // 协商缓存报304，但并不会报来自于内存
//           return;
//         }
//       }

//       res.end(data);
//     }
//     // 协商缓存etag
//     if (pathname === "/etag.png") {
//       const data = fs.readFileSync("./public/etag.png");

//       const etagData = etag(data);
//       console.log("etag:", etagData);
//       res.setHeader("ETag", etagData);
//       res.setHeader("Cache-Control", "no-cache");

//       const ifNoneMatch = req.headers["if-none-match"];

//       if (ifNoneMatch) {
//         if (etagData == ifNoneMatch) {
//           console.log("etag cache");
//           res.statusCode = 304;
//           res.end(); // 协商缓存报304，但并不会报来自于内存
//           return;
//         }
//       }

//       res.end(data);
//     }
//   })
//   .listen(PORT, () => {
//     console.log(`Server is running at PORT ${PORT}`);
//   });
