const fs = require("fs");
const source = fs.readFileSync("./test.vue").toString();
module.exports = source;
