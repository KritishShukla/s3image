import express from 'express'

import multer from 'multer'
import sharp from 'sharp'
import crypto from 'crypto'

import { PrismaClient } from '@prisma/client'
import { uploadFile, deleteFile, getObjectSignedUrl } from './s3.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
app.use(express.json())

app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.posts.findMany({ orderBy: [{ created: 'desc' }] });
    for (let post of posts) {
      post.imageUrl = await getObjectSignedUrl(post.imageName);
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

    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer()

    await uploadFile(fileBuffer, imageName, file.mimetype)

    const post = await prisma.posts.create({
      data: {
        imageName,
        caption,
      },
    })

    res.status(201).send(post)
  } catch (error) {
    console.error("Error creating post:", error)
    res.status(500).send({ error: "Internal Server Error" })
  }
})

app.delete("/api/posts/:id", async (req, res) => {
  const id = +req.params.id
  const post = await prisma.posts.findUnique({where: {id}}) 

  await deleteFile(post.imageName)

  await prisma.posts.delete({where: {id: post.id}})
  res.send(post)
})

app.listen(8080, () => console.log("listening on port 8080"))