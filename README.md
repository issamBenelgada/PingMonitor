
# PingMonitor

Simple Windows app to monitor your ping.

The app allows you to ping a location periodically while logging the results to a .csv file.
Additionally, the ping is analyzed to display the status and stats of your network in real time.

<img src="https://gitlab.com/issambenelgada/PingMonitor/-/raw/master/screenshots/Capture%20d'%C3%A9cran%202024-05-30%20135115.png?ref_type=heads">


## Use cases
- Ploting ping against time for a long period of time.
- Diagnosing network problems related to ping.
- Real-time assessment of current network 'quality' for people having periodic network problems.

## Features

- Global network status varying between 'Good' and 'Unusable' calculated in real time.
- Current ping along with the mean and median over the last elapsed minute.
- Peak calculation using a configurable threshold.
- Peak stats, including 'peaks per minute', 'peaks mean ping' and 'peaks max ping'
- Ping logging to a .csv file.

## How it works

When the app is launched, it will start to ping the remote address in its config file and log the results.\
Additionally, it will analyze these pings to display some stats in real-time.

### Ping stats

- Ping : Current value of ping in ms.
- Ping mean : Mean ping over the last minute.
- Ping median : Median ping over the last minute.

### Peaks

The app classifies a ping value as a peak if its value exceeds the value of 'Ping median + peakThreshold'. peakThreshold is 200ms by default.

### Data logging

The app logs all the ping data to the file 'outputLog.csv' inside the executable folder.

There are numerous online tools to plot the content of the file. One good example is 'https://www.csvplot.com/'

### Network status

The network status is calculated using the number of peaks detected over the last minute.

- GOOD : Number of peaks over the last minute is less than or equal to 'nbPeaksMaxPerMinuteGood'. Default value 2.

- MODERATE : Number of peaks over the last minute is less than or equal to 'nbPeaksMaxPerMinuteGood'. Default value 5.

- BAD : Number of peaks over the last minute is less than or equal to 'nbPeaksMaxPerMinuteBad'. Default value 20.

- UNUSABLE : Number of peaks over the last minute is bigger than 'nbPeaksMaxPerMinuteBad'.

There is a second network status displaying the status over the last 5 minutes. It works the same as the first one but uses the number of peaks over the last 5 minutes and the thresholds multiplied by 5.

### Configuration

The app uses a configuration file inside the executable folder named 'config.json'.

- address : remote address to use for pings.

- interval : Interval between ping requests in ms. (default : 100ms)

- peakThreshold : Threshold used to calculate peaks in ms. (default : 200ms)

- nbPeaksMaxPerMinuteGood : Threshold used in the network status. (default 2)

- nbPeaksMaxPerMinuteModerate : Threshold used in the network status. (default 5)

- nbPeaksMaxPerMinuteBad : Threshold used in the network status. (default 20)

### Screenshots


<img src="https://gitlab.com/issambenelgada/PingMonitor/-/raw/master/screenshots/Capture%20d'%C3%A9cran%202024-05-30%20135229.png?ref_type=heads">


<img src="https://gitlab.com/issambenelgada/PingMonitor/-/raw/master/screenshots/Capture%20d'%C3%A9cran%202024-05-30%20160333.png?ref_type=heads">

