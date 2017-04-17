/**
 * @module audio-buffer-remix
 */
'use strict'

const isAudioBuffer = require('is-audio-buffer')
const AudioBuffer = require('audio-buffer')
const isPlainObj = require('is-plain-obj')

module.exports = remix


remix.speakerMap = {
  1: {
    2: [0, 0],
    4: [0, 0, null, null],
    6: [null, null, 0, null, null]
  },
  2: {
    1: [(dest, source) => {
      let left = source.getChannelData(0)
      let right = source.getChannelData(1)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = .5 * (left[i] + right[i])
      }
    }],
    4: [0, 1, null, null],
    6: [0, 1, null, null, null, null]
  },
  4: {
    1: [(dest, source) => {
      let left = source.getChannelData(0)
      let right = source.getChannelData(1)
      let sleft = source.getChannelData(2)
      let sright = source.getChannelData(3)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = .25 * (left[i] + right[i] + sleft[i] + sright[i])
      }
    }],
    2: [
       (dest, source) => {
        let left = source.getChannelData(0)
        let sleft = source.getChannelData(2)
        for (let i = 0, l = dest.length; i < l; i++) {
          dest[i] = .5 * (left[i] + sleft[i])
        }
      },
      (dest, source) => {
        let right = source.getChannelData(1)
        let sright = source.getChannelData(3)
        for (let i = 0, l = dest.length; i < l; i++) {
          dest[i] = .5 * (right[i] + sright[i])
        }
      }
    ],
    6: [0, 1, null, null, 2, 3]
  },
  6: {
    1: [(dest, source) => {
      let left = source.getChannelData(0)
      let right = source.getChannelData(1)
      let center = source.getChannelData(2)
      let sleft = source.getChannelData(4)
      let sright = source.getChannelData(5)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = 0.7071 * (left[i] + right[i]) + center[i] + 0.5 * (sleft[i] + sright[i])
      }
    }],
    2: [(dest, source) => {
      let left = source.getChannelData(0)
      let center = source.getChannelData(2)
      let sleft = source.getChannelData(4)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = left[i] + 0.7071 * (center[i] + sleft[i])
      }
    }, (dest, source) => {
      let right = source.getChannelData(1)
      let center = source.getChannelData(2)
      let sright = source.getChannelData(5)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = right[i] + 0.7071 * (center[i] + sright[i])
      }
    }],
    4: [(dest, source) => {
      let left = source.getChannelData(0)
      let center = source.getChannelData(2)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = left[i] + 0.7071 * center[i]
      }
    }, (dest, source) => {
      let right = source.getChannelData(1)
      let center = source.getChannelData(2)
      for (let i = 0, l = dest.length; i < l; i++) {
        dest[i] = right[i] + 0.7071 * center[i]
      }
    }, 4, 5]
  }
}

remix.discreteMap = Array(32).fill(0).map((v, i) => i)


function remix (source, channels, options) {
  if (!isAudioBuffer(source)) throw Error('Pass AudioBuffer as the first param')
  let inputChannels = source.numberOfChannels

  //shortcut same number
  if (channels === inputChannels) return source;

  if (!options) options = {}
  else if (typeof options === 'string') options = {interpretation: options}

  let interpretation = options.interpretation || 'speaker'

  //obtain map
  let map
  if (typeof channels === 'number') {
    if (interpretation == 'discrete') {
      map = remix.discreteMap.slice(0, channels)
    }
    else {
      let inputMap = remix.speakerMap[inputChannels]
      if (inputMap) {
        map = inputMap[channels]
      }
      //if match is not found - do discrete interpretation
      if (!map) {
        map = remix.discreteMap.slice(0, channels)
      }
    }
  }
  else if (isPlainObj(channels)) {
    let arrMap = []
    for (let i in channels) {
      arrMap[i] = channels[i]
    }
    map = arrMap
    channels = map.length
  }
  else if (Array.isArray(channels)) {
    map = channels
    channels = channels.length
  }
  else {
    throw Error('Target number of channels should be a number or map')
  }

  //source is buffer list - do per-buffer mapping
  if (source.map) {
    return source.map(mapBuffer)
  }
  //otherwise map once
  else {
    return mapBuffer(source)
  }

  function mapBuffer (source) {
    let dest = new AudioBuffer(channels, source.length, {context: options.context})
    for (let c = 0; c < channels; c++) {
      let outputData = dest.getChannelData(c)
      let mapper = map[c]
      if (mapper == null) continue;
      if (typeof mapper == 'number') {
        if (mapper >= source.numberOfChannels) continue;
        let inputData = source.getChannelData(mapper)
        outputData.set(inputData)
      }
      else if (typeof mapper == 'function') {
        mapper(outputData, source)
      }
    }
    return dest
  }

  return dest
}
