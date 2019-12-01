import ImageRecognition from "./ImageRecognition.js";
import { hideElement, showElement } from "./utils/utils.js";
import find from "lodash/find";
import { yellowBinItems } from "./data/yellowBinList";
import { greenBinItems } from "./data/greenBinList";
import { blueBinItems } from "./data/blueBinList";
import { cyanBinItems } from "./data/cyanBinList";
import { blackBinItems } from "./data/blackBinList";

import "./App.css";

export default class App {
  constructor() {
    this.confirmationButtons = document.getElementById("confirmation-buttons");
    this.classificationDiv = document.getElementById(
      "recycling-classification"
    );
    this.doneButton = document.getElementById("next");
    this.resultDiv = document.getElementById("result");
    this.guessButton = document.getElementById("guess-button");
    this.startButton = document.getElementsByClassName("start-button")[0];
    this.introBlock = document.getElementsByClassName("intro")[0];
    this.feedSection = document.getElementsByClassName("feed")[0];
    this.recognitionFeature = new ImageRecognition();
  }

  init = () => {
    this.recognitionFeature.loadModel().then(() => {
      this.startButton.classList.remove("blinking");
      this.startButton.innerText = "Start";
      this.startButton.onclick = () => this.start();
    });
  };

  start() {
    hideElement(this.introBlock);
    showElement(this.feedSection);

    this.recognitionFeature
      .initiateWebcam()
      .then(() => {
        this.guessButton.classList.remove("blinking");
        this.guessButton.innerText = "Este reciclabil?";
        this.guessButton.onclick = () => {
          this.predict();
        };
      })
      .catch(() => {
        hideElement(this.guessButton);
        this.resultDiv.innerHTML = `Camera indisponibila. Acest demo are nevoie de o camera accesibila.`;
      });
  }

  predict = () => {
    this.recognitionFeature.runPredictions().then(predictionsResult => {
      if (predictionsResult.length) {
        let predictedObject = predictionsResult[0].class.split(",")[0];
        /* Filter out human factor if other object is detected */
        if (
          predictionsResult.length > 1 &&
          predictionsResult[0].class.split(",")[0] === "person"
        ) {
          predictedObject = predictionsResult[1].class.split(",")[0];
        }
        /* End of human filter */
        this.resultDiv.innerText = "";
        this.resultDiv.innerHTML = `Is it a ${predictedObject}?`;
        hideElement([this.classificationDiv, this.guessButton]);

        this.classifyItem(predictionsResult[0].class.split(",")[0]);
      }
    });
  };

  classifyItem = item => {
    const yellowItemFound = find(
      yellowBinItems,
      yellowBinItem => item === yellowBinItem
    );
    const greenItemFound = find(
      greenBinItems,
      greenBinItem => item === greenBinItem
    );
    const blueItemFound = find(
      blueBinItems,
      blueBinItem => item === blueBinItem
    );
    const cyanItemFound = find(
      cyanBinItems,
      cyanBinItem => item === cyanBinItem
    );
    const blackItemFound = find(
      blackBinItems,
      blackBinItem => item === blackBinItem
    );

    if (yellowItemFound) {
      this.displayButtons("yellow");
    } else if (greenItemFound) {
      this.displayButtons("green");
    } else if (blueItemFound) {
      this.displayButtons("blue");
    } else if (cyanItemFound) {
      this.displayButtons("cyan");
    } else if (blackItemFound) {
      this.displayButtons("black");
    } else {
      this.displayButtons("none");
    }
  };

  displayButtons = color => {
    showElement([this.confirmationButtons, this.resultDiv]);

    const yesButton = document.getElementById("yes");
    const noButton = document.getElementById("no");

    yesButton.onclick = () => this.displayClassification(color);
    noButton.onclick = () => this.predict();
  };

  displayClassification = color => {
    this.showClassification();
    let content;

    switch (color) {
      case "yellow":
        content = `Este reciclabil! Arunca-l in recipientul galben! 🎉`;
        this.showFinalMessage(content);
        break;
      case "green":
        content = `Este reciclabil! Arunca-l in recipientul verde! 🎉`;
        this.showFinalMessage(content);
        break;
      case "blue":
        content = `Este reciclabil! Arunca-l in recipientul albastru! 🎉`;
        this.showFinalMessage(content);
        break;
      case "cyan":
        content = `RoRec message here or smtg.`;
        this.showFinalMessage(content);
        break;
      case "black":
        content = `Nu este reciclabil! 😢Arunca-l in tomberonul negru.`;
        this.showFinalMessage(content);
        break;
      case "none":
        content = `Obiectul nu a putut fi recunoscut...\n
        Este facut din plastic, aluminium, hartie sau sticla?`;
        this.displayLastButtons();
        break;
      default:
        break;
    }

    this.resultDiv.innerHTML = content;
  };

  displayLastButtons = () => {
    showElement([this.confirmationButtons, this.resultDiv]);

    const yesButton = document.getElementById("yes");
    const noButton = document.getElementById("no");

    yesButton.onclick = () =>
      this.showFinalMessage(
        "Probabil il poti arunca in recipientul galben! 🎉"
      );
    noButton.onclick = () =>
      this.showFinalMessage("Hmm, arunca-l in recipientul negru.");
  };

  showFinalMessage = content => {
    this.resultDiv.innerHTML = content;
    hideElement(this.confirmationButtons);
    showElement(this.doneButton);

    this.doneButton.onclick = () => {
      showElement(this.guessButton);
      hideElement([this.classificationDiv, this.doneButton, this.resultDiv]);
    };
  };

  showClassification = () => {
    showElement(this.classificationDiv);
  };
}
