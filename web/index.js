const fs = require('fs')
const express = require('express')
const cors = require('cors')
const multer  = require('multer')
const AWS = require('aws-sdk')
const { Octokit } = require("octokit")

const app = express()
app.use(cors())
const port = 3000
const upload = multer({ dest: 'uploads/' })

// DigitalOcean
const { DO_SPACES_KEY, DO_SPACES_SECRET } = process.env;
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

  // Upload ESP File to DigitalOcean Spaces
  await new Promise((resolve, reject) => {
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

  // Trigger GitHub Actions workflow
  await octokit.request('POST /repos/dragonjet-labs/sfcp-flows/actions/workflows/spriggit-win/dispatches', {
    owner: 'dragonjet-labs',
    repo: 'sfcp-flows',
    workflow_id: 'spriggit-win',
    ref: 'main',
    inputs: {
      branchname: req.body.branchname,
      message: req.body.message,
      espfile: `https://sfcp-submissions.sfo3.digitaloceanspaces.com/${originalname}`,
    },
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
})

// Web app listener
app.listen(port, () => {
  console.log(`SFCP Submissions Web on Port ${port}`)
})