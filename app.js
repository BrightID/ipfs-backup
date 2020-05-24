const IpfsHttpClient = require("ipfs-http-client");
const express = require("express");

const app = express();
const ipfs = IpfsHttpClient();

app.use(express.json({ limit: "2kb" }));
app.use(express.urlencoded({ extended: false }));

const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    res.status(500).json({ error: error.message });
  });
};

app.get(
  "/backups/:key1/:key2",
  asyncMiddleware(async (req, res) => {
    const { key1, key2 } = req.params;
    const path = `/${key1}/${key2}`;

    const chunks = [];
    for await (const chunk of ipfs.files.read(path)) {
      chunks.push(chunk);
    }
    res.send(Buffer.concat(chunks));
  })
);

app.put(
  "/backups/:key1/:key2",
  asyncMiddleware(async (req, res) => {
    const { data } = req.body;
    const { key1, key2 } = req.params;
    const path = `/${key1}/${key2}`;

    await ipfs.files.write(path, data, {
      create: true,
      parents: true,
      truncate: true,
    });

    const stat = await ipfs.files.stat(path, { hash: true });
    const cid = stat?.cid?.toString();

    res.json({ success: true, cid });
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Backup Service running at http://localhost:${port}`)
);
