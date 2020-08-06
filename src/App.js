import React, {useState, useRef} from 'react';
import './App.css';

function App() {

  const [localImage, setLocalImage] = useState('');
  const imageInput = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [category, setCategory] = useState('');
  const [accuracy, setAccuracy] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);

  const labels = [
    'Early Blight',
    'Leaf Miner',
    'Powdery Mildew',
    'Septoria Leaf Spot'
  ]

  const handleFileChange = e =>{
    const file = imageInput.current.files[0];

    if(!file)
    {
      setLocalImage('');
      setAccuracy('');
      setCanSubmit(false);
      return;
    }

    if (file && file.type && file.type.indexOf('image') === -1) {
      console.log('File is not an image.', file.type, file);
      return;
    }
  
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      setLocalImage(event.target.result)
    });
    reader.readAsDataURL(file);

    setCanSubmit(true);
  }

  //Determine which of our categories are the largest
  const findHighestCategory = (results) =>{

    let highestIndex = 0;
    let highestPercent = results[0] *100;
    
    for(let i = 1; i < results.length; i++){
      if(results[i] > results[highestIndex]){
        //update highest index if our results are highest
        highestIndex = i;
        highestPercent = results[i] * 100;
      }
    }

    return {labelIndex: highestIndex, percent: highestPercent};
  }

  const getBorderClass = () => {
    
    //Default
    if(!accuracy){
      return '';
    }
    
    //Above 80
    if(accuracy >= 80){
      return 'green-border'
    }
    else if(accuracy > 50 && accuracy < 80)
    {
      return 'yellow-border'
    }
    else if(accuracy <= 50){
      return 'red-border'
    }
  }

  const getTextClass = () =>{
    //Default
    if(!accuracy){
      return '';
    }
    
    //Above 80
    if(accuracy >= 80){
      return 'green-text'
    }
    else if(accuracy > 50 && accuracy < 80)
    {
      return 'yellow-text'
    }
    else if(accuracy <= 50){
      return 'red-text'
    }
  }

  const handleResponseData = data =>{
    // const labelIndex = findHighestCategory(data.prediction);

    const {labelIndex, percent} = findHighestCategory(data.prediction);

    setCategory(labels[labelIndex]);
    setAccuracy(percent);
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
    setCanSubmit(false);

    var reader = new FileReader();
    reader.readAsDataURL(imageInput.current.files[0]);
    reader.onload = function () {
      //console.log(reader.result);
      postImage(reader.result.toString().replace(/^data:(.*,)?/, ''));
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
      setCanSubmit(true);
    };

    
  }

  const generatePredictionData = () =>{
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
      </header>
      <main className="container">
      <section>
        <p>This application is a proof of concept using a machine learning model (AWS Sagemaker) to predict which disease a tomato leaf contains. It was built over a weekend with a very small data set (~10 images per disease). Because of this, the application has the follow caveats:</p>
        <ul>
          <li>Images must be .jpg format</li>
          <li>Images need to be 200x200 for the most accurate results</li>
          <li>Images must be one of the follow diseases: 
            <ul>
              <li>Early Blight</li>
              <li>Septoria Leaf Spot</li>
              <li>Powdery Mildew</li>
              <li>Leaf Miner</li>
            </ul>
          </li>
        </ul>
        </section>
      <section className="App-container">
        <p>
          <strong>Please select a photo below to get started:</strong>
        </p>
        <img src={localImage} className={`plant-image ${getBorderClass()}`}/>
        <form>
          <input type="file" id="file-selector" accept=".jpg" ref={imageInput} onChange={handleFileChange} />
          
          {canSubmit &&
            <button onClick={submitImage}>Submit For Evaluation</button>
          }   
        </form>

        {/* Prediction */}
        {category &&
          <h2>The disease is most likely <span className={getTextClass()}>{category}</span></h2>
        }

        {category && accuracy <=50 &&
          <p className={getTextClass()}>The accuracy of this prediction is very low. Try using a different photo.</p>
        }

        <div>
          <h3>Prediction Data:</h3>
          <table>
            <tbody>{generatePredictionData()}</tbody>
          </table>
        </div> 
        </section>

      </main>
    </div>
  );
}

export default App;
