# Tomato Leaf Disease Identification Proof of Concept

## About

This project is a machine learning proof of concept for identifying diseases on tomato plant leaves. Currently, we have the following labels:

* Early Blight
* Leaf Miner
* Powdery Mildew
* Leaf Spot

As this is a proof of concept, not all tomato leaf diseases are used in this ML Model.

### Model

The ML model is built using a Jupyter notebook on Amazon Sagemaker. The endpoint is currently hosted as an AWS Lambda using an API Gateway.
Due to the cost of using multiple t2.medium instances to host Jupyter Notebooks and the model endpoint, I will most likely shut them down once I am able to prove that my concept works.

### Installation

```
npm install
npm start
```

## Future Work

* Use Semantic UI to design a better-looking web application
* Make web application responsive
* Add the ability to crop/resize image before upload
 * This would use HTML5 canvas to manipulate and upload the image data

