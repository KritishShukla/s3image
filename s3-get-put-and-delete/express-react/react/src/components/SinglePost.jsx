import { ChatIcon, UserIcon, TrashIcon, PencilIcon } from '@heroicons/react/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/outline'
import { useEffect, useState } from 'react'
import axios from 'axios'

async function downloadImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}


export default function SinglePost({ className, post, likeClicked, commentClicked, editClicked, deletePostClicked,editImageClicked }) {
  const { _id, caption, imageUrl, totalComments, totalLikes } = post
  const [imageBlob, setImageBlob] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  useEffect(() => {
    async function fetchImage() {
      const blob = await downloadImage(imageUrl);
      console.log("Imageblob ",blob)
      setImageBlob(blob);
    }
    fetchImage();
  }, [imageUrl]);

  useEffect(() => {
    if (imageBlob) {
      const blobUrl = URL.createObjectURL(imageBlob);
      setImageSrc(blobUrl);
    }
  }, [imageBlob]);


  return (
    <div className={className + ' outline-1'} style={{ width: 650 }}>

      <div className="flex flex-col space-y-2">

        <div className="flex flex-row items-center space-x-4 cursor-pointer active:opacity-80">
          <UserIcon className='cursor-pointer hover:text-gray-900 active:text-gray-700 h-10 w-10 text-gray-700' />
          <p className="text-base hover:underline">username</p>
        </div>

        <p className="text-base">{caption}</p>

        <div className="flex flex-row items-end space-x-4 justify-center">

          <img className="rounded" width="50" height="50" src={imageSrc}  alt="Post" />

          {/* Actions */}
          <div className='flex flex-row items-center space-x-4'>
            <div className='flex flex-col items-center' onClick={() => likeClicked({ _id })}>
              <HeartOutline className='cursor-pointer hover:text-gray-900 active:text-gray-700 h-8 w-8 text-gray-700' />
              <p>{totalLikes}</p>
            </div>
            <div className='flex flex-col items-center' onClick={() => commentClicked({ _id })}>
              <ChatIcon className='cursor-pointer hover:text-gray-900 active:text-gray-700 h-8 w-8 text-gray-700' />
              <p>{totalComments}</p>
            </div>
           
            <div className='flex flex-col items-center' onClick={() => {
              console.log("Clicked - _id:", _id);
              console.log("Clicked - imageUrl:", imageSrc);
              editImageClicked({ _id, imageUrl: imageSrc }); 
              }}>
                <PencilIcon className='cursor-pointer hover:text-gray-900 active:text-gray-700 h-8 w-8 text-gray-700' />
                <p>Edit</p>
                </div>
                
              <div className='flex flex-col items-center' onClick={() => deletePostClicked({ _id })}>
              <TrashIcon className='cursor-pointer hover:text-gray-900 active:text-gray-700 h-8 w-8 text-gray-700' />
              <p>Delete</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
