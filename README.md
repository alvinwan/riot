# Riot
A simple desktop app that detects which room you're in. The gif below is a demo of both training and prediction.

**Interested in building this app step-by-step, or curious how it works in more detail? See the article on Smashing Magazine, ["Building a Room Detector for IoT Devices on Mac OS"](https://www.smashingmagazine.com/2018/08/building-room-detector-iot-devices-mac-os/)**

by Alvin Wan [alvinwan.com](http://alvinwan.com)

![out1](https://user-images.githubusercontent.com/2068077/43188908-28702bb8-8faa-11e8-9194-903225ba36c0.gif)

# How it works

How can we detect the moment you're close to an appliance? With today’s commodity hardware, there are a myriad of possibilities. One solution is to equip each appliance with bluetooth. However, maintaining an array of Bluetooth devices is significant overhead--from replacing batteries to replacing dysfunctional devices. Additionally, distance from a Bluetooth device to you might not always be the answer: if you’re in the living room, by the wall shared with the kitchen, you wouldn’t want your oven, microwave, and toaster to all start churning out food. Another, albeit impractical, solution is to use GPS. However, GPS works poorly indoors, where the multitude of walls, other signals, and other obstacles wreak havoc on GPS’s precision.

This app uses the list of all in-range WiFi networks and their associated strengths. This method has the distinct advantages of 1) not requiring more hardware e.g., an array of beacon devices around the building, 2) relying on more stable signals like WiFi, and 3) working well where other techniques such as GPS are weak--the more barriers the better, as the more disparate the WiFi network strengths, the easier the rooms are to classify.

This demonstration is written up as a desktop application, as iOS mobile devices do not allow the developer access to in-range wifi networks. (At least, there is no public API.)

# Methods

There are two pairs of scripts, one pair for each model:

1. one for a least squares model with one-hot encoded labels and softmax applied to output--`model/train.py`, `model/eval.py`.
2. one for kmeans clustering. In order to correspond centroids to labels, I take a majority vote for all members in the cluster, to associate a label with the centroid--`model/train_kmeans.py`, `model/eval_kmeans.py`.

Latter is more robust. There is no featurization, regularization etc. Those are all potential avenues of exploration, but clustering seems to work well enough practically speaking.

# Installation

Install Python dependencies with pip.

```
pip install numpy scipy
```

From the repository root (in the directory with `package.json`), install all packages.

```
npm install
```

Create a directory for your data.

```
mkdir data
```

To get started, run the desktop app.

```
npm start
```
