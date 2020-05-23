const IPFS = require("ipfs");
const express = require("express");

const app = express();

app.use(express.json({ limit: "2kb" }));
app.use(express.urlencoded({ extended: false }));

const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(500).json({ error: error.message });
  });
};

async function main() {
  const node = await IPFS.create();
  app.get(
    "/backups/:key1/:key2",
    asyncMiddleware(async (req, res) => {
      const { key1, key2 } = req.params;
      const path = `/${key1}/${key2}`;

      const chunks = [];
      for await (const chunk of node.files.read(path)) {
        chunks.push(chunk);
      }
      res.send(Buffer.concat(chunks));
    })
  );

  app.put(
    "/backups/:key1/:key2",
    asyncMiddleware(async (req, res) => {
      const { data } = await req.body;
      const { key1, key2 } = req.params;
      const path = `/${key1}/${key2}`;

      await node.files.write(path, Buffer.from(data), {
        create: true,
        parents: true,
      });

      const stat = await node.files.stat(path, { hash: true });

      res.json({ success: true, stat });
    })
  );
}

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Notifications Service running at http://localhost:${port}`)
);

main();
