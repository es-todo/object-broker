import * as engine from "engine.io";

const server = engine.listen(3000, {}, () => {
  console.log("engine listening on 3000");
});

server.on("connection", (conn) => {
  console.log(`connection!`);
});
