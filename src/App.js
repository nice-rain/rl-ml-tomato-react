import React, {useState, useRef} from 'react';
import './App.css';

function App() {

  const [localImage, setLocalImage] = useState('');
  const imageInput = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [category, setCategory] = useState('');

  const labels = [
    'Early Blight',
    'Leaf Miner',
    'Powdery Mildew',
    'Septoria Leaf Spot'
  ]

  const handleFileChange = e =>{
    const file = imageInput.current.files[0];

    if (file && file.type && file.type.indexOf('image') === -1) {
      console.log('File is not an image.', file.type, file);
      return;
    }
  
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      setLocalImage(event.target.result)
    });
    reader.readAsDataURL(file);
  }

  const findHighestCategory = (results) =>{
    let highestIndex = 0;
    
    for(let i = 1; i < results.length; i++){
      if(results[i] > results[highestIndex]){
        //update highest index if our results are highest
        highestIndex = i;
      }
    }

    return highestIndex;
  }

  const handleResponseData = data =>{
    const labelIndex = findHighestCategory(data.prediction);
    setCategory(labels[labelIndex]);

    setPredictions(data.prediction);
  }

  const postImage = (base64) =>{
    const params={
      endpointRegion: 'us-east-1',
      endpointName: 'IC-tomato-1594821424',
      base64Image: base64
    }
    //console.log(params);

    fetch('https://api.nicera.in/tomato', {
      method: 'post',
      body: JSON.stringify(params)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        handleResponseData(data);
    })
    .catch(err =>{
      console.log(err);
    });
  }

  const submitImage = (e) =>{
    e.preventDefault();
    console.log('submitting image to API');

    var reader = new FileReader();
    reader.readAsDataURL(imageInput.current.files[0]);
    reader.onload = function () {
      //console.log(reader.result);
      postImage(reader.result.toString().replace(/^data:(.*,)?/, ''));
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

    
  }

  const generatePredictionData = () =>{
    console.log('setting prediction list');

    if(predictions.length)
    {

      return predictions.map((prediction, index) =>{

        let percent = prediction * 100;

        return (
        <tr key={`prediction_${index}`}>
          <td>{labels[index]}</td><td>{percent.toFixed(3)}%</td></tr>
        );
      });
    }
    return null;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tomato Leaf Disease Identification</h1>
        <p>
          Please select an image of a tomato leaf to be identified:
        </p>
      </header>
      <main>
        <img src={localImage}/>
        <form>
          <input type="file" id="file-selector" accept=".jpg" ref={imageInput} onChange={handleFileChange} />
          
          {imageInput && imageInput.current &&
            <button onClick={submitImage}>Submit For Evaluation</button>
          }   
        </form>

        {/* Prediction */}
        {category &&
          <h2>The disease is most likely {category}</h2>
        }

        <div>
          <h3>Prediction Data:</h3>
          <table>
            <tbody>{generatePredictionData()}</tbody>
          </table>
        </div> 
      </main>
    </div>
  );
}

export default App;
