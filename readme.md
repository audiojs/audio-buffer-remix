# audio-buffer-remix [![Build Status](https://travis-ci.org/audiojs/audio-buffer-remix.svg?branch=master)](https://travis-ci.org/audiojs/audio-buffer-remix) [![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Upmix or downmix channels in [AudioBuffer](https://github.com/audiojs/audio-buffer) or [AudioBufferList](https://github.com/audiojs/audio-buffer-list) by the following tables.

Speaker interpretation:

| Input Channels | Output Channels | Rules |
|---|---|---|
| 1 (Mono) | 2 (Stereo) | |
| 1 (Mono) | 4 (Quad) | |
| 1 (Mono) | 6 (5.1) | |
| 2 (Stereo) | 1 (Mono) | |
| 2 (Stereo) | 4 (Quad) | |
| 2 (Stereo) | 6 (5.1) | |
| 4 (Quad) | 1 (Mono) | |
| 4 (Quad) | 4 (Quad) | |
| 4 (Quad) | 6 (5.1) | |
| 6 (5.1) | 1 (Mono) | |
| 6 (5.1) | 4 (Quad) | |
| 6 (5.1) | 6 (5.1) | |
| Other | Other | Non-standard layouts use `discrete` interpretation. |

Discrete interpretation:

| Input Channels | Output Channels | Rules |
|---|---|---|
| 1 (Mono) | 2 (Stereo) | |
| 1 (Mono) | 4 (Quad) | |


## Usage

[![npm install audio-buffer-remix](https://nodei.co/npm/audio-buffer-remix.png?mini=true)](https://npmjs.org/package/audio-buffer-remix/)

```js
const AudioBuffer = require('audio-buffer')
const remix = require('audio-buffer-remix')

let audioBuffer = new AudioBuffer(2, 1024)

//convert stereo buffer to quad buffer
audioBuffer = remix(audioBuffer, 4)
```

## API

### `let dest = remix(source, channels|map, {context, interpretation}?)`

Take `source` audio buffer/list and upmix/downmix its channels to `dest` with the indicated number of `channels`. `options` may provide audio context or interpretation type `'discrete'` or `'speaker'`, see [channelInterpretation MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelInterpretation).

```js
let src = new AudioBuffer(2, 1024)

//mix stereo to quad
let dest = remix(src, 4)
```

Alternately pass `map` — a list or object with channel mapping. Numbers as values will map source to dest channel directly, `null` will fill output channel data with zeros, function will take `(destChannelData, source) => {}` signature, expecting to fill `destChannelData` array.

```js
const util = require('audio-buffer-utils')

let source = util.noise(util.create(1024, 2))

let dest = remix(source, {
	//0 output channel - take first input channel data
	0: 1,

	//1 output channel - mute the data
	1: null,

	//2 output channel - mix 0 + 1 channels
	2: (destChannel, source) => {
		let left = source.getChannelData(0)
		let right = source.getChannelData(1)
		for (let i = 0; i < out.length; i++) {
			destChannel[i] = left[i] * .5 + right[i] * .5
		}
	}
})

dest.numberOfChannels // 3
```

## See also

* [audio](https://github.com/audiojs/audio) — high-level class for audio
* [audio-buffer](https://github.com/audiojs/audio-buffer) — audio buffer class for nodejs and browser
* [audio-buffer-list](https://github.com/audiojs/audio-buffer-list) — audio buffer class for nodejs and browser
* [audio-buffer-utils](https://github.com/audio-buffer-utils) — toolset for audio buffers
