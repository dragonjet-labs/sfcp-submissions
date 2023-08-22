const fs = require('fs')
const express = require('express')
const cors = require('cors')
const multer  = require('multer')
const AWS = require('aws-sdk')

const app = express()
app.use(cors())
const port = 3000
const upload = multer({ dest: 'uploads/' })

const { DO_SPACES_KEY, DO_SPACES_SECRET } = process.env;
const spacesEndpoint = new AWS.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  region: 'sfo3',
  endpoint: spacesEndpoint,
  accessKeyId: DO_SPACES_KEY,
  secretAccessKey: DO_SPACES_SECRET,
});

app.post('/submit', upload.single('espFile'), async (req, res) => {
  const { originalname, path: filePath } = req.file;

  const upload = await new Promise((resolve, reject) => {
    let fileStream = fs.createReadStream(filePath)
    s3.putObject({
      Bucket: 'sfcp-submissions',
      Key: originalname,
      CacheControl: `public, max-age=86400`,
      ACL: 'public-read',
      Body: fileStream,
    }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  res.json({
    branchname: req.body.branchname,
    espFile: req.file,
    message: req.body.message,
    upload,
  })
})

app.listen(port, () => {
  console.log(`SFCP Submissions Web on Port ${port}`)
})