//version1
import express from 'express'
import multer from 'multer'
import crypto from 'crypto'
import mongoose from 'mongoose'; 
import { uploadFile, deleteFile, getObjectSignedUrl } from './s3.js'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
dotenv.config()

const app = express()

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
app.use(express.json())

const postSchema = new mongoose.Schema({
  caption: String,
  imageName: String,
  created: Date,
  imageUrl: String
});

const Post = mongoose.model('Post', postSchema);







app.get('/api/getObjectSignedUrl', async (req, res) => {
  const imageName = req.query.imageName;
  
  try {
    const imageUrl = await getObjectSignedUrl(imageName)
    res.send(imageUrl);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    // const posts = await Post.find().sort({ created: -1 }).exec();
    // res.send(posts);
    const posts = await Post.find().sort({ created: -1 }).exec();
    
    for (let post of posts) {
      post.imageUrl = await getObjectSignedUrl(post.imageName)
    }
    res.send(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const file = req.file
    const caption = req.body.caption
    const imageName = generateFileName()
    
    const imageUrl =await uploadFile(file.buffer, imageName, file.mimetype)
  
    const post = new Post({
      imageName,
      caption,
      created: new Date(),
      imageUrl:imageUrl
    });

    await post.save();
    res.status(201).send(post)
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).send({ error: "Internal Server Error" })
  }
})

app.delete("/api/posts/:id", async (req, res) => {
  const id = req.params.id
  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    await deleteFile(post.imageName);
    await Post.findByIdAndDelete(id);
    res.send(post)
  } catch (error) { 
    console.error("Error deleting post:", error)
  }
})

app.post("/api/upload-to-s3", upload.single('image'),async (req, res) => {
  try {
    const file = req.file
    const imageId = req.body.imageId;
    const imageName = generateFileName()

    const imageUrl =await uploadFile(file.buffer, imageName, file.mimetype)
    const prevpost= await Post.findById(imageId)
    console.log("previousPost",prevpost)
    const caption= prevpost.caption
    const post = new Post({
      imageName,
      caption,
      created: new Date(),
      imageUrl:imageUrl
    });

    await post.save();
    res.status(200).json({ s3ImageUrl: imageUrl });
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

app.listen(8080, () => console.log("listening on port 8080"))
