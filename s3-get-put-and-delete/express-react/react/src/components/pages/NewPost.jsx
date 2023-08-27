import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


export default function NewPost() {  

  const [file, setFile] = useState();
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");

  const navigate = useNavigate()

  const submit = async event => {
    event.preventDefault()

    const formData = new FormData();
    formData.append("image", file)
    formData.append("title", title);
    formData.append("caption", caption)
    console.log("FormData:", formData);
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    console.log(formData);
    try {
      await axios.post("http://13.48.94.31:8080/api/posts", formData, {
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
    console.log("Selected File :", file);
	}

  return (
    <div className="flex flex-col items-center justify-center">

        <form onSubmit={submit} style={{width:650}} className="flex flex-col space-y-5 px-5 py-14">
          <input onChange={fileSelected} type="file" name="image" accept="image/*"></input>
          <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder='Title'></input>
          <input value={caption} onChange={e => setCaption(e.target.value)} type="text" placeholder='Caption'></input>
          <button type="submit">Submit</button>
        </form>

    </div>
  )
}
