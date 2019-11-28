import ImageRecognition from './ImageRecognition.js';
import {hideElement, showElement} from './utils/utils.js';
import find from 'lodash/find';
import {yellowBinItems} from './data/yellowBinList';
import {redBinItems} from './data/redBinList';

import './App.css';

export default class App{
  constructor(){
    this.confirmationButtons = document.getElementById('confirmation-buttons');
    this.classificationDiv = document.getElementById('recycling-classification');
    this.doneButton = document.getElementById('next');
    this.resultDiv = document.getElementById('result');
    this.guessButton = document.getElementById('guess-button');
    this.startButton = document.getElementsByClassName('start-button')[0];
    this.introBlock = document.getElementsByClassName('intro')[0];
    this.feedSection = document.getElementsByClassName('feed')[0];
    this.recognitionFeature = new ImageRecognition();
  }

  init = () => {
    this.recognitionFeature.loadModel()
      .then(() => {
        this.startButton.classList.remove('blinking');
        this.startButton.innerText = 'Start';
        this.startButton.onclick = () => this.start();
      })
  }

  start(){
    hideElement(this.introBlock);
    showElement(this.feedSection);

    this.recognitionFeature.initiateWebcam()
      .then(() => {
        this.guessButton.classList.remove('blinking');
        this.guessButton.innerText = 'Este reciclabil?';
        this.guessButton.onclick = () => {
          this.predict();
        };
      }).catch(() => {
        hideElement(this.guessButton);
        this.resultDiv.innerHTML = `Camera indisponibila. Acest demo are nevoie de o camera accesibila.`;
      })
  }

  predict = () => {
    this.recognitionFeature.runPredictions()
    .then((predictionsResult) => {
      if(predictionsResult.length){
        this.resultDiv.innerText = '';
        this.resultDiv.innerHTML = `Is it a ${predictionsResult[0].class.split(',')[0]}?`;
        hideElement([this.classificationDiv, this.guessButton]);

        this.classifyItem(predictionsResult[0].class.split(',')[0]);
      }
    });
  }

  classifyItem = item => {
    const yellowItemFound = find(yellowBinItems, yellowBinItem => item === yellowBinItem);
    const redItemFound = find(redBinItems, redBinItem => item === redBinItem);

    if(yellowItemFound){
      this.displayButtons('yellow')
    } else if(redItemFound) {
      this.displayButtons('red')
    } else {
      this.displayButtons('none')
    }
  }

  displayButtons = color => {
    showElement([this.confirmationButtons, this.resultDiv])

    const yesButton = document.getElementById('yes');
    const noButton = document.getElementById('no');

    yesButton.onclick = () => this.displayClassification(color);
    noButton.onclick = () => this.predict();
  }

  displayClassification = color => {
    this.showClassification();
    let content;

    switch(color){
      case "yellow":
        content = `Este reciclabil! Arunca-l in recipientul ${color}! 🎉`;
        this.showFinalMessage(content);
        break;
      case "red":
        content = `Nu este reciclabil! 😢Arunca-l in tomberonul ${color}.`;
        this.showFinalMessage(content);
        break;
      case "none":
        content = `Obiectul nu a putut fi recunoscut...\n
        Este facut din plastic, aluminium, hartie, sticla sau carton?`;
        this.displayLastButtons();
        break;
      default:
        break;
    }

    this.resultDiv.innerHTML = content;
  }

  displayLastButtons = () => {
    showElement([this.confirmationButtons, this.resultDiv])

    const yesButton = document.getElementById('yes');
    const noButton = document.getElementById('no');

    yesButton.onclick = () => this.showFinalMessage("Probabil il poti arunca in recipientul galben! 🎉");
    noButton.onclick = () => this.showFinalMessage("Hmm, arunca-l in recipientul negru.");
  }

  showFinalMessage = content => {
    this.resultDiv.innerHTML = content;
    hideElement(this.confirmationButtons)
    showElement(this.doneButton)

    this.doneButton.onclick = () => {
      showElement(this.guessButton)
      hideElement([this.classificationDiv, this.doneButton, this.resultDiv])
    }
  }

  showClassification = () => {
    showElement(this.classificationDiv);
  }
}
