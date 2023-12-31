// import exiftoolBin from 'dist-exiftool';
// import exiftool from 'node-exiftool';
// import fs from 'fs';
// import path from 'path';
// import MetaDataModel from '../models/meta.models';

// export const createMetaData = (req, res, next) => {
//     try {
//         if (!req.file) {
//             return res.status(404).send({ message: "File Not Found", status: 404 });
//         }
//         const PHOTO_PATH = path.join(__dirname, '../public/upload/' + req.file.filename);
//         const rs = fs.createReadStream(PHOTO_PATH);
//         const ep = new exiftool.ExiftoolProcess(exiftoolBin);
//         ep.open()
//             .then(() => ep.readMetadata(rs, ['-File:all']))
//             .then(async (result) => {
//                 let metadata = new MetaDataModel({
//                     fileName: req.file.filename,
//                     originalName: req.file.originalname,
//                     size: req.file.size,
//                     information: result.data[0]
//                 });
//                 metadata = await metadata.save();
//                 return res.send(metadata);
//             })
//             .then(() => ep.close(), () => ep.close())
//             .catch(console.error);

//     } catch (error) {
//         next(error);
//     }
// };

// export const getAllMetaData = async (req, res, next) => {
//     try {
//         let allData = await MetaDataModel.find({}).sort({ createdAt: -1 });
//         res.send(allData);
//     } catch (error) {
//         next(error);
//     }
// };

// export const deleteMetaData = async (req, res, next) => {
//     try {
//         let metadata = await MetaDataModel.findOneAndDelete({ _id: req.params.id });
//         if (!metadata) {
//             return res.status(400).send({ message: "Metadata not exist" });
//         }
//         const PHOTO_PATH = path.join(__dirname, '../public/upload/' + metadata.fileName);
//         fs.unlink(PHOTO_PATH, (err, data) => {
//             if (err) {
//                 // Handle error if needed
//             }
//         });
//         res.send({ message: "Deleted Successfully", status: 200 });
//     } catch (error) {
//         next(error);
//     }
// };
