# audio-buffer-remix [![Build Status](https://travis-ci.org/audiojs/audio-buffer-remix.svg?branch=master)](https://travis-ci.org/audiojs/audio-buffer-remix) [![Greenkeeper badge](https://badges.greenkeeper.io/audiojs/audio-buffer-remix.svg)](https://greenkeeper.io/) [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Upmix or downmix channels in [AudioBuffer](https://github.com/audiojs/audio-buffer) or [AudioBufferList](https://github.com/audiojs/audio-buffer-list) by the following table:

| Input Channels | Output Channels | Rules |
|---|---|---|
| 1 (Mono) | 2 (Stereo) | output[0] = input[0]<br/>output[1] = input[0] |
| 1 (Mono) | 4 (Quad) | output[0] = input[0]<br/>output[1] = input[0]<br/>output[2] = 0<br/>output[3] = 0 |
| 1 (Mono) | 6 (5.1) | output[0] = 0<br/>output[1] = 0<br/>output[2] = input[0]<br/>output[3] = 0<br/>output[4] = 0<br/>output[5] = 0 |
| 2 (Stereo) | 1 (Mono) | output[0] = 0.5 * (input[0] + input[1]) |
| 2 (Stereo) | 4 (Quad) | output[0] = input[0]<br/>output[1] = input[1]<br/>output[2] = 0<br/>output[3] = 0 |
| 2 (Stereo) | 6 (5.1) | output[0] = input[0]<br/>output[1] = input[1]<br/>output[2] = 0<br/>output[3] = 0<br/>output[4] = 0<br/>output[5] = 0 |
| 4 (Quad) | 1 (Mono) | output[0] = 0.25 * (input[0] + input[1] + input[2] + input[3]) |
| 4 (Quad) | 2 (Stereo) | output[0] = 0.5 * (input[0] + input[2])<br/>output[1] = 0.5 * (input[1] + input[3]) |
| 4 (Quad) | 6 (5.1) | output[0] = input[0]<br/>output[1] = input[1]<br/>output[2] = 0<br/>output[3] = 0<br/>output[4] = input[2]<br/>output[5] = input[3] |
| 6 (5.1) | 1 (Mono) | output[0] = 0.7071 * (input[0] + input[1]) + input[2] + 0.5 * (input[2] + input[3]) |
| 6 (5.1) | 2 (Stereo) | output[0] = input[0] + 0.7071 * (input[2] + input[4])<br/>output[1] = input[1] + 0.7071 * (input[2] + input[5]) |
| 6 (5.1) | 4 (Quad) | output[0] = input[0] + 0.7071 * input[2]<br/>output[1] = input[1] + 0.7071 * input[2]<br/>output[2] = input[4]<br/>output[3] = input[5] |
| n | m | output[n] = input[n] |

## Usage

[![npm install audio-buffer-remix](https://nodei.co/npm/audio-buffer-remix.png?mini=true)](https://npmjs.org/package/audio-buffer-remix/)

```js
const AudioBuffer = require('audio-buffer')
const remix = require('audio-buffer-remix')

let stereoBuffer = new AudioBuffer(2, 1024)

quadBuffer = remix(stereoBuffer, 4)
```

## API

### `let dest = remix(source, channels|map, {context, interpretation}?)`

Take `source` audio buffer/list and upmix/downmix its channels to `dest` with the indicated number of `channels`. `options` may provide audio `context` or interpretation type: `'discrete'` or `'speaker'`, see [channelInterpretation MDN reference](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelInterpretation).

Alternately pass `map` − a list or object with channel mapping. Numbers as values map channels directly by numbers, `null` drops channel from output and function with `(destChannelData, source) => {}` signature expects to fill `destChannelData` array.

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
