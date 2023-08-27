import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


export default function NewPost() {  

  const [file, setFile] = useState()
  const [caption, setCaption] = useState("")

  const navigate = useNavigate()

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData();
    formData.append("image", file)
    formData.append("caption", caption)
    console.log("FormData:", formData);
          for (let pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
          }
    try {
      await axios.post("/api/posts", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error) {
      console.error('Error sending POST request:', error);
    }
    navigate("/")
  }

  const fileSelected = event => {
    const file = event.target.files[0]
		setFile(file)
	}

  return (
    <div className="flex flex-col items-center justify-center">

      <form onSubmit={submit} style={{ width: 650 }} className="flex flex-col space-y-5 px-5 py-14">
        <input onChange={fileSelected} type="file" name="image" accept="image/*"></input>
        <input
          value={caption}
          onChange={e => setCaption(e.target.value)}
          type="text"
          placeholder="Caption"
          className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          className="bg-orange-400 text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Submit
        </button>
      </form>

    </div>
  )
}
