const status_short_div = document.getElementById("status-short-div");
const status_short_message = document.getElementById("status-short-message");

const status_long_div = document.getElementById("status-long-div");
const status_long_message = document.getElementById("status-long-message");

const ping = document.getElementById("ping");
const pingMean = document.getElementById("ping-mean");
const pingMedian = document.getElementById("ping-median");
const pingMeanWithoutPeaks = document.getElementById("ping-mean-without-peaks");
const peaksPerMinute = document.getElementById("peaks-per-minute");
const peaksMeanPing = document.getElementById("peaks-mean-ping");
const peaksMaxPing = document.getElementById("peaks-max-ping");
const timeNetworkGood = document.getElementById("time-network-good");

function setShortGood() {
  status_short_div.style["background-color"] = "green";
  status_short_message.innerText = "GOOD";
}

function setShortBad() {
  status_short_div.style["background-color"] = "tomato";
  status_short_message.innerText = "BAD";
}

function setShortModerate() {
  status_short_div.style["background-color"] = "orange";
  status_short_message.innerText = "MODERATE";
}

function setShortUnusable() {
  status_short_div.style["background-color"] = "black";
  status_short_message.innerText = "UNUSABLE";
}

function setLongGood() {
  status_long_div.style["background-color"] = "green";
  status_long_message.innerText = "GOOD";
}

function setLongBad() {
  status_long_div.style["background-color"] = "tomato";
  status_long_message.innerText = "BAD";
}

function setLongModerate() {
  status_long_div.style["background-color"] = "orange";
  status_long_message.innerText = "MODERATE";
}

function setLongUnusable() {
  status_long_div.style["background-color"] = "black";
  status_long_message.innerText = "UNUSABLE";
}

function setValue(element, value) {
  element.innerText = value.toString();
}

window.electronAPI.onPingUpdate((value) => {
  if (value.scoreShort == 0) {
    setShortGood();
  } else if (value.scoreShort == 1) {
    setShortModerate();
  } else if (value.scoreShort == 2) {
    setShortBad();
  } else {
    setShortUnusable();
  }

  if (value.scoreLong == 0) {
    setLongGood();
  } else if (value.scoreLong == 1) {
    setLongModerate();
  } else if (value.scoreLong == 2) {
    setLongBad();
  } else {
    setLongUnusable();
  }

  setValue(ping, value.ping);
  setValue(pingMean, value.pingMean);
  setValue(pingMedian, value.pingMedian);
  setValue(pingMeanWithoutPeaks, value.pingMeanWithoutPeaks);
  setValue(peaksPerMinute, value.peaksPerMinute);
  setValue(peaksMeanPing, value.peaksMeanPing);
  setValue(peaksMaxPing, value.peaksMaxPing);
  setValue(timeNetworkGood, value.timeNetworkGood);
});
