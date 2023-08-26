import React, { useState,useEffect  } from "react";
import "./main.scss";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { GrRotateLeft, GrRotateRight } from "react-icons/gr";
import { CgMergeVertical, CgMergeHorizontal } from "react-icons/cg";
import { IoMdUndo, IoMdRedo, IoIosImage } from "react-icons/io";
import storeData from "./linked";
import Navbar from "../navbar/navbar";
import Compressor from "compressorjs";
import { useLocation } from "react-router-dom";
var  imageUrlll=""
const ImageEditorMain = () => {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const imageUrlParam = queryParams.get('imageUrl');
  useEffect(() => {
    if (imageUrlParam) {
      console.log("ImgaeUrl in EditIamge ",imageUrlParam)
      if(imageUrlParam != null){
        imageUrlll=imageUrlParam
      }
      
      imageHandle(null,imageUrlll)
    }
  }, [imageUrlParam]);


  const filterElement = [
    {
      name: "brightness",
      maxValue: 200,
    },
    {
      name: "grayscale",
      maxValue: 200,
    },
    {
      name: "sepia",
      maxValue: 200,
    },
    {
      name: "saturate",
      maxValue: 200,
    },
    {
      name: "contrast",
      maxValue: 200,
    },
    {
      name: "hueRotate",
    },
  ];
  const [property, setProperty] = useState({
    name: "brightness",
    maxValue: 200,
  });
  const [details, setDetails] = useState("");
  const [crop, setCrop] = useState("");
  const [state, setState] = useState({
    image: "",
    brightness: 100,
    grayscale: 0,
    sepia: 0,
    saturate: 100,
    contrast: 100,
    hueRotate: 0,
    rotate: 0,
    vartical: 1,
    horizental: 1,
    compressionQuality: 0.8,
  });
  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };
  const leftRotate = () => {
    setState({
      ...state,
      rotate: state.rotate - 90,
    });

    const stateData = state;
    stateData.rotate = state.rotate - 90;
    storeData.insert(stateData);
  };

  const rightRotate = () => {
    setState({
      ...state,
      rotate: state.rotate + 90,
    });
    const stateData = state;
    stateData.rotate = state.rotate + 90;
    storeData.insert(stateData);
  };
  const varticalFlip = () => {
    setState({
      ...state,
      vartical: state.vartical === 1 ? -1 : 1,
    });
    const stateData = state;
    stateData.vartical = state.vartical === 1 ? -1 : 1;
    storeData.insert(stateData);
  };

  const horizentalFlip = () => {
    setState({
      ...state,
      horizental: state.horizental === 1 ? -1 : 1,
    });
    const stateData = state;
    stateData.horizental = state.horizental === 1 ? -1 : 1;
    storeData.insert(stateData);
  };

  const redo = () => {
    const data = storeData.redoEdit();
    if (data) {
      setState(data);
    }
  };
  const undo = () => {
    const data = storeData.undoEdit();
    if (data) {
      setState(data);
    }
  };

  const imageHandle = (e,imageUrl = null) => {
    if (imageUrl) {
      // Set the image using the provided URL
      setState({
        ...state,
        image: imageUrl,
      });
    } else if (e.target.files.length !== 0) {
      const file = e.target.files[0]; // Get the uploaded file
      const reader = new FileReader();
  
      reader.onload = () => {
        setState({
          ...state,
          image: reader.result,
        });
  
        const stateData = {
          image: reader.result,
          brightness: 100,
          grayscale: 0,
          sepia: 0,
          saturate: 100,
          contrast: 100,
          hueRotate: 0,
          rotate: 0,
          vartical: 1,
          horizental: 1,
        };
        storeData.insert(stateData);
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };
  
  const imageCrop = () => {
    const canvas = document.createElement("canvas");
    const scaleX = details.naturalWidth / details.width;
    const scaleY = details.naturalHeight / details.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      details,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const base64Url = canvas.toDataURL("image/jpg");

    setState({
      ...state,
      image: base64Url,
    });
  };
  const saveImage = () => {
    if (details && state.image) {
      const canvas = document.createElement("canvas");
      canvas.width = details.naturalWidth;
      canvas.height = details.naturalHeight;
      const ctx = canvas.getContext("2d");
  
      ctx.filter = `brightness(${state.brightness}%) brightness(${state.brightness}%) sepia(${state.sepia}%) saturate(${state.saturate}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) hue-rotate(${state.hueRotate}deg)`;
  
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((state.rotate * Math.PI) / 180);
      ctx.scale(state.vartical, state.horizental);
  
      ctx.drawImage(
        details,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );
  
      const link = document.createElement("a");
      link.download = "image_edit." + getFileExtension(state.image);
      canvas.toBlob((blob) => {
        link.href = URL.createObjectURL(blob);
        link.click();
      });

      canvas.toBlob(async (blob) => {
        if (blob) {
          // Create a FormData object to send the edited Blob to the backend
          const formData = new FormData();
          formData.append("image", blob);
          console.log(formData)
          try {
            const response = await axios.post("/api/upload-to-s3", formData);
            if (response.status === 200) {
              // The edited image has been uploaded to S3, get the S3 image URL
              const s3ImageUrl = response.data.s3ImageUrl;
  
              // Create a link element for download
              const link = document.createElement("a");
              link.download = "edited_image.jpg"; // Set the download filename
              link.href = s3ImageUrl;
              link.click();
            } else {
              console.error("Failed to upload image to S3");
            }
          } catch (error) {
            console.error("Error uploading image to S3:", error);
          }
        }
      }, "image/jpeg");
    }
  };
  
  const getFileExtension = (dataUrl) => {
    const mimeType = dataUrl.split(",")[0].split(":")[1].split(";")[0];
    const extension = mimeType.split("/")[1];
    return extension;
  };
  
  
 
  
  

  const compressImage = () => {
    // if (state.image) {
    //   new Compressor(state.image, {
    //     quality: state.compressionQuality, // Use the specified compression quality
    //     maxWidth: 800, // Adjust maxWidth as needed
    //     success(result) {
    //       handleImageCompression(result);
    //     },
    //     error(err) {
    //       console.error('Compression error:', err.message);
    //     },
    //   });
    // }
  };
  

  const handleImageCompression = (compressedBlob) => {
    // const compressedImageUrl = URL.createObjectURL(compressedBlob);
    // setState({
    //   ...state,
    //   image: compressedImageUrl,
    // });
  };

  return (
    <>
       <Navbar/>
    <div className="image_editor">
   
      <div className="card">
        <div className="card_header">
          <h2>------ Image Editor ------</h2>
        </div>
        <div className="card_body">
          <div className="sidebar">
            <div className="side_body">
              <div className="filter_section">
                <span>Filters</span>
                <div className="filter_key">
                  {filterElement.map((v, i) => (
                    <button
                      className={property.name === v.name ? "active" : ""}
                      onClick={() => setProperty(v)}
                      key={i}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter_slider">
                <div className="label_bar">
                  <label htmlFor="range">Rotate</label>
                  <span>100%</span>
                </div>
                <input
                  name={property.name}
                  onChange={inputHandle}
                  value={state[property.name]}
                  max={property.maxValue}
                  type="range"
                />
              </div>
              <div className="rotate">
                <label htmlFor="">Rotate & Filp</label>
                <div className="icon">
                  <div onClick={leftRotate}>
                    <GrRotateLeft />
                  </div>
                  <div onClick={rightRotate}>
                    <GrRotateRight />
                  </div>
                  <div onClick={varticalFlip}>
                    <CgMergeVertical />
                  </div>
                  <div onClick={horizentalFlip}>
                    <CgMergeHorizontal />
                  </div>
                </div>
              </div>
            </div>
            <div className="reset">
            <button>Reset</button>
            <button onClick={saveImage} className="save">
              Save Image
            </button>
            {/* Place the compression quality slider and span beside the "Compress Image" button */}
            <div className="compression-options">
              <button onClick={compressImage} className="compress">
                Compress Image
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01" // Adjust the step value as needed
                value={state.compressionQuality}
                onChange={(e) => setState({ ...state, compressionQuality: parseFloat(e.target.value) })}
              />
              <span>Compression Quality: {state.compressionQuality}</span>
            </div>
          </div>
          </div>
          <div className="image_section">
            <div className="image">
              {state.image ? (
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
                  <img
                    onLoad={(e) => setDetails(e.currentTarget)}
                    style={{
                      filter: `brightness(${state.brightness}%) brightness(${state.brightness}%) sepia(${state.sepia}%) saturate(${state.saturate}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%) hue-rotate(${state.hueRotate}deg)`,
                      transform: `rotate(${state.rotate}deg) scale(${state.vartical},${state.horizental})`,
                    }}
                    src={state.image}
                    alt=""
                  />
                </ReactCrop>
              ) : (
                <label htmlFor="choose">
                  <IoIosImage />
                  <span>Choose Image</span>
                </label>
              )}
            </div>
            <div className="image_select">
              <button onClick={undo} className="undo">
                <IoMdUndo />
              </button>
              <button onClick={redo} className="redo">
                <IoMdRedo />
              </button>
              {crop && (
                <button onClick={imageCrop} className="crop">
                  Crop Image
                </button>
              )}
              <label htmlFor="choose">Choose Image</label>
              <input onChange={imageHandle} type="file" id="choose" />
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ImageEditorMain;
