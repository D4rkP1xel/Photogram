import { useEffect, useState } from 'react'
import axios from 'axios'

function Test() {

    const [imageToUpload, setImageToUpload] = useState(null)
    const [imageToPreview, setImageToPreview] = useState(null)

    function handleChangeImage(event) {
        setImageToUpload(event.target.files[0])

        const reader = new FileReader()
        reader.readAsDataURL(event.target.files[0])
        reader.onloadend = () => {
            setImageToPreview(reader.result)
        }
    }
    async function submitImage() {
        if (imageToUpload === null) {
            alert("No image selected")
            return
        }
        if (imageToUpload.size >= 3000000) {
            alert("Image Size is too big")
            return
        }
        const reader = new FileReader()
        reader.readAsDataURL(imageToUpload)
        reader.onloadend = async () => {
            try {
                const response = await axios.post("https://photogram-backend-production.up.railway.app/images/upload", {
                    image: reader.result
                })
                console.log(response)
            }
            catch (err) {
                console.log(err)
            }
        }

    }
return (
    <div>
        <input type={"file"} onChange={(event) => handleChangeImage(event)} />
        <button onClick={async () => await submitImage()}>Submit</button>
        {imageToPreview && (<img src={imageToPreview} className="h-48" />)}
    </div>
)
}

export default Test
