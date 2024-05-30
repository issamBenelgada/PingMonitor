const humanizeDuration = require("humanize-duration");
const fs = require("fs");
const outputLog = fs.createWriteStream("./outputLog.csv");
const errorsLog = fs.createWriteStream("./errorsLog.log");

const consoler = new console.Console(outputLog, errorsLog);

const Monitor = require("ping-monitor");

class PingStats {
  MAX_NUMBER_SAMPLES = 10000;

  SCORE_SHORT_MINUTES = 1;
  SCORE_LONG_MINUTES = 5;

  NETWORK_SCORE_GOOD = 0;
  NETWORK_SCORE_MODERATE = 1;
  NETWORK_SCORE_BAD = 2;
  NETWORK_SCORE_UNUSABLE = 3;

  constructor(callback, config) {
    this.callback = callback;
    this.samples = [];
    this.cursor = -1;
    this.lastTimeNotGood = new Date(Date.now());
    this.peakThreshold = config.peakThreshold;
    this.nbPeaksMaxPerMinuteGood = config.nbPeaksMaxPerMinuteGood;
    this.nbPeaksMaxPerMinuteModerate = config.nbPeaksMaxPerMinuteModerate;
    this.nbPeaksMaxPerMinuteBad = config.nbPeaksMaxPerMinuteBad;
  }

  setCallback(callback) {
    this.callback = callback;
  }

  addSample(ping) {
    this.cursor = (this.cursor + 1) % this.MAX_NUMBER_SAMPLES;
    this.samples[this.cursor] = ping;

    const callbackObject = {
      ping: ping.value,
      pingMean: this.getMeanLastNSeconds(60).toFixed(2),
      pingMedian: this.getMedianLastNSeconds(60),
      pingMeanWithoutPeaks: this.getMeanWithoutPeaksLastNSeconds(60).toFixed(2),
      peaksPerMinute: this.countPeaksLastNSeconds(60),
      peaksMeanPing: Math.floor(this.peaksMeanPingLastNSeconds(60)),
      peaksMaxPing: this.peaksMaxPingLastNSeconds(),
    };

    const peaksPerMinute = this.countPeaksLastNSeconds(
      60 * this.SCORE_SHORT_MINUTES
    );
    const peaksPer5Minues = this.countPeaksLastNSeconds(
      60 * this.SCORE_LONG_MINUTES
    );

    callbackObject.scoreShort =
      peaksPerMinute <= this.nbPeaksMaxPerMinuteGood * this.SCORE_SHORT_MINUTES
        ? this.NETWORK_SCORE_GOOD
        : peaksPerMinute <=
          this.nbPeaksMaxPerMinuteModerate * this.SCORE_SHORT_MINUTES
        ? this.NETWORK_SCORE_MODERATE
        : peaksPerMinute <=
          this.nbPeaksMaxPerMinuteBad * this.SCORE_SHORT_MINUTES
        ? this.NETWORK_SCORE_BAD
        : this.NETWORK_SCORE_UNUSABLE;

    callbackObject.scoreLong =
      peaksPer5Minues <= this.nbPeaksMaxPerMinuteGood * this.SCORE_LONG_MINUTES
        ? this.NETWORK_SCORE_GOOD
        : peaksPer5Minues <=
          this.nbPeaksMaxPerMinuteModerate * this.SCORE_LONG_MINUTES
        ? this.NETWORK_SCORE_MODERATE
        : peaksPer5Minues <=
          this.nbPeaksMaxPerMinuteBad * this.SCORE_LONG_MINUTES
        ? this.NETWORK_SCORE_BAD
        : this.NETWORK_SCORE_UNUSABLE;

    if (callbackObject.scoreShort > this.NETWORK_SCORE_MODERATE) {
      this.lastTimeNotGood = new Date(Date.now());
    }

    const durationSinceNotGood = new Date(Date.now()) - this.lastTimeNotGood;

    callbackObject.timeNetworkGood = humanizeDuration(
      Math.floor(durationSinceNotGood / 1000) * 1000
    );

    this.callback(callbackObject);
  }

  getLastValue() {
    return this.samples[this.cursor].value;
  }

  getArrayLastNSeconds(seconds) {
    const pingsLastMinute = [];
    let cursorI = this.cursor;
    const lastPingTime = this.samples[this.cursor].time;

    while (true) {
      if (lastPingTime - this.samples[cursorI].time > 1000 * seconds) {
        break;
      }

      pingsLastMinute.push(this.samples[cursorI]);
      cursorI = cursorI - 1;
      if (cursorI < 0) {
        cursorI = this.MAX_NUMBER_SAMPLES - 1;
      }

      if (!this.samples[cursorI]) {
        break;
      }

      if (cursorI == this.cursor) {
        break;
      }
    }

    return pingsLastMinute;
  }

  getMeanLastNSeconds(seconds) {
    const pingsLastNSeconds = this.getArrayLastNSeconds(seconds);
    const sum = pingsLastNSeconds.reduce((a, b) => a + b.value, 0);
    return sum / pingsLastNSeconds.length;
  }

  getMedianLastNSeconds(seconds) {
    const pingsLastNSeconds = this.getArrayLastNSeconds(seconds);
    return median(pingsLastNSeconds.map((v) => v.value));
  }

  getMeanWithoutPeaksLastNSeconds(seconds) {
    const pingsLastMinute = this.getArrayLastNSeconds(seconds);
    const median = this.getMedianLastNSeconds(seconds);
    let sum = 0;
    let n = 0;

    pingsLastMinute.forEach((p) => {
      if (p.value > median + this.peakThreshold) {
        return;
      }

      sum += p.value;
      n += 1;
    });

    return sum / n;
  }

  countPeaksLastNSeconds(seconds) {
    const pingsLastMinute = this.getArrayLastNSeconds(seconds);
    const median = this.getMedianLastNSeconds(seconds);
    let n = 0;

    pingsLastMinute.forEach((p) => {
      if (p.value > median + this.peakThreshold) {
        n += 1;
      }
    });

    return n;
  }

  peaksMeanPingLastNSeconds(seconds) {
    const pingsLastMinute = this.getArrayLastNSeconds(seconds);
    const median = this.getMedianLastNSeconds(seconds);
    let sum = 0;
    let n = 0;

    pingsLastMinute.forEach((p) => {
      if (p.value <= median + this.peakThreshold) {
        return;
      }

      sum += p.value;
      n += 1;
    });

    if (n == 0) {
      return 0;
    }

    return sum / n;
  }

  peaksMaxPingLastNSeconds(seconds) {
    const median = this.getMedianLastNSeconds(seconds);
    let max = 0;

    this.samples.forEach((p) => {
      if (!p) {
        return;
      }

      if (p.value > median + this.peakThreshold) {
        if (p.value > max) {
          max = p.value;
        }
      }
    });

    return max;
  }
}

consoler.log("Date, Ping");

function createMonitor() {
  try {
    JSON.parse(fs.readFileSync("config.json", "utf8"));
  } catch (e) {
    consoler.error(e.toString());
    throw e;
  }
  const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

  const pingStats = new PingStats(() => {}, config);

  const myWebsite = new Monitor({
    address: config.address,
    interval: config.interval,
    protocol: "tcp",
    config: {
      intervalUnits: "milliseconds",
    },
  });

  function nowString() {
    const now = new Date(Date.now());
    now.setUTCMinutes(now.getUTCMinutes() - now.getTimezoneOffset());

    return now.toJSON() + ", ";
  }

  myWebsite.on("up", (res, state) => {
    pingStats.addSample({ time: Date.now(), value: res.responseTime });
    consoler.log(nowString() + res.responseTime);
  });

  myWebsite.on("down", (res, state) => {
    consoler.error(nowString() + "down: " + JSON.stringify(res));
  });

  myWebsite.on("error", (res, state) => {
    consoler.error(nowString() + "error: " + JSON.stringify(res));
  });

  myWebsite.on("timeout", (res, state) => {
    consoler.error(nowString() + "timeout: " + JSON.stringify(res));
  });

  myWebsite.on("stop", (res, state) => {
    consoler.error(nowString() + "stop: " + JSON.stringify(res));
  });

  return {
    on: (f) => {
      pingStats.setCallback(f);
    },
  };
}

function median(values) {
  if (values.length === 0) {
    throw new Error("Input array is empty");
  }
  values = [...values].sort((a, b) => a - b);

  const half = Math.floor(values.length / 2);

  return values.length % 2
    ? values[half]
    : (values[half - 1] + values[half]) / 2;
}

exports.createMonitor = createMonitor;
