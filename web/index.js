const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const multer  = require('multer')
const AWS = require('aws-sdk')
const { Octokit } = require("octokit")

const app = express()
app.use(cors())
const port = 8080
const upload = multer({ dest: 'uploads/' })

// DigitalOcean
const { DO_SPACES_KEY, DO_SPACES_SECRET, GITHUB_TOKEN } = process.env;
const spacesEndpoint = new AWS.Endpoint('sfo3.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: DO_SPACES_KEY,
  secretAccessKey: DO_SPACES_SECRET,
});

// GitHub
const octokit = new Octokit({ auth: GITHUB_TOKEN })

// Submit Endpoint
app.post('/submit', upload.single('espFile'), async (req, res) => {
  const { originalname, path: filePath } = req.file;

  const unix = Math.floor(new Date().getTime() / 1000);
  
  const extname = path.extname(originalname);
  const basename = path.basename(originalname, extname).replace(/[^a-zA-Z0-9]/gi, '');
  const newname = `${basename}-${unix}`;
  const branchname = `esp/${newname}`
  const espUrl = `https://sfcp-submissions.sfo3.digitaloceanspaces.com/${newname}${extname}`

  // Upload ESP File to DigitalOcean Spaces
  await new Promise((resolve, reject) => {
    let fileStream = fs.createReadStream(filePath)
    s3.putObject({
      Bucket: 'sfcp-submissions',
      Key: `${newname}${extname}`,
      CacheControl: `public, max-age=86400`,
      ACL: 'public-read',
      Body: fileStream,
    }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  // Trigger GitHub Actions workflow
  await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner: 'dragonjet-labs',
    repo: 'sfcp-flows',
    workflow_id: '66602836',
    ref: 'main',
    inputs: {
      branchname,
      message: req.body.message,
      espfile: espUrl,
    },
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  // Response
  res.json({
    espUrl,
    branchname,
    redirect: 'https://github.com/dragonjet-labs/sfcp-flows/actions',
  })
})

// Serve static frontend
app.use('/', express.static('dist'))

// Web app listener
app.listen(port, () => {
  console.log(`SFCP Submissions Web on Port ${port}`)
})