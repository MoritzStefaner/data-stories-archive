# Data Stories Archive

This is the data and code behind the [Data Stories Podcast Archive](https://archive.datastori.es).

It is based on automatic audio transcriptions of the 170 episodes we recorded since February 2012. 

## [data](data/)

We used <https://www.assemblyai.com/> to transcribe the audio files. 

The data folder contains both the unprocessed output of the automatic transcription, as well as the revised versions:
The automatic transcription works very well for known English words, but has its limitations for proper names or domain specific terms. 
So we used custom word replacement lists to fix some of the most apparent misspellings. 

## [www](www/)
The web application is a custom frontend for this dataset.

It is accessible online at
<https://archive.datastori.es/>

<img width="1912" alt="image" src="https://github.com/user-attachments/assets/72741d1f-7685-494e-b2f1-211009055458">

It allows browsing and search of the transcripts, and also the playback of the corresponding audio files.

## Observable Notebook
You can also explore and download the data (along with some additional download statistics) in an [https://observablehq.com/@moritzstefaner/data-stories-archive](Observable Notebook).

## Authors

- Miska Knapek (Data processing)
- Moritz Stefaner (Concept, design and web code)


