# VoxRead Chrome Extension

VoxRead is a Chrome extension that converts webpage content into natural-sounding audio.

## Features

- Extracts clean article content from the active tab
- Converts text to speech using a backend API
- Supports multiple voice options
- Supports playback speed preferences
- Includes playback controls (play, pause, resume, stop)
- Supports audio download as MP3
- Uses chunked playback for longer articles

## Download

Get the extension here:
https://github.com/Vermadeepakd1/voxread-extension/releases

## Installation in Chrome

Use one of the following methods.

### Method 1: Install from a release ZIP

1. Download the latest release ZIP from the Releases page.
2. Extract the ZIP to a local folder.
3. Open Chrome and go to chrome://extensions/.
4. Enable Developer mode (top-right).
5. Click Load unpacked.
6. Select the extracted extension folder.

### Method 2: Load from local source

1. Clone or download this repository.
2. Open Chrome and go to chrome://extensions/.
3. Enable Developer mode (top-right).
4. Click Load unpacked.
5. Select the article-audio-extension folder.

## How to Use

1. Open any article or content page in Chrome.
2. Click the VoxRead extension icon.
3. Click Extract Article.
4. Choose a voice and speed.
5. Click Play to listen.
6. Optionally click Download to save the audio file.

## How It Works

1. The extension extracts readable page content using Readability.js.
2. The content is sent to the VoxRead backend TTS endpoint.
3. Audio is returned in MP3 format.
4. The extension plays audio in chunks and supports downloading.

## Backend Endpoint

https://voxread-backend.onrender.com/

## Tech Stack

- JavaScript
- Chrome Extensions API
- HTML
- CSS
