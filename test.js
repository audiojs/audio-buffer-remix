'use strict';

const t = require('tape')
const remix = require('./')
const AudioBuffer = require('audio-buffer')
const util = require('audio-buffer-utils')

t('discrete: * to *', t => {
  let zero = new Float32Array(1024)
  for (let from = 1; from <= 8; from++) {
    for (let to = 1; to <= 8; to++) {
      let a = util.noise(AudioBuffer(from, 1024))
      let b = remix(a, to, 'discrete')

      t.equal(b.numberOfChannels, to)

      //test that channel data is copied
      for (let x = 1; x < Math.min(from, to); x++) {
        t.deepEqual(b.getChannelData(x), a.getChannelData(x))
      }

      //test that rest of data is zero
      if (to > from) {
        for (let x = from; x < to; x++) {
          t.deepEqual(b.getChannelData(x), zero)
        }
      }
    }
  }

  t.end()
})

t('speaker: mono to *', t => {
  let data0 = [0,0,0,0,0,0]
  let data1 = [0,0,1,1,-1,-1]
  let mono = new AudioBuffer(1, data1)
  let stereo = new AudioBuffer(2, [data1, data1])
  let quad = new AudioBuffer(4, [data1, data1, data0, data0])
  let dolby = new AudioBuffer(6, [data0, data0, data1, data0, data0, data0])

  t.deepEqual(remix(mono, 2), stereo)
  t.deepEqual(remix(mono, 4), quad)
  t.deepEqual(remix(mono, 6), dolby)

  t.end()
})


t('speaker: stereo to *', t => {
  let data0 = [0,0,0,0,0,0]
  let dataL = [0,0,1,1,-1,-1]
  let dataR = [1,1,0,0,0,0]
  let stereo = new AudioBuffer(2, [dataL, dataR])
  let mono = new AudioBuffer(1, [.5,.5,.5,.5,-.5,-.5])
  let quad = new AudioBuffer(4, [dataL, dataR, data0, data0])
  let dolby = new AudioBuffer(6, [dataL, dataR, data0, data0, data0, data0])

  t.deepEqual(remix(stereo, 1), mono)
  t.deepEqual(remix(stereo, 4), quad)
  t.deepEqual(remix(stereo, 6), dolby)

  t.end()
})



t('speaker: quad to *', t => {
  let data0 = [0,0,0,0,0,0]
  let dataL =  [0,0,1,1,-1,-1]
  let dataSL = [1,1,1,1,-1,-1]
  let dataR =  [0,0,0,0, -1, -1]
  let dataSR = [1,1,0,0,-1,-1]

  let quad = new AudioBuffer(4, [dataL, dataR, dataSL, dataSR])
  let mono = new AudioBuffer(1, [.5, .5, .5, .5, -1, -1])
  let stereo = new AudioBuffer(2, [[.5, .5, 1, 1, -1, -1], [.5, .5, 0, 0, -1, -1]])
  let dolby = new AudioBuffer(6, [dataL, dataR, data0, data0, dataSL, dataSR])

  t.deepEqual(remix(quad, 1), mono)
  t.deepEqual(remix(quad, 2), stereo)
  t.deepEqual(remix(quad, 6), dolby)

  t.end()
})

t('speaker: dolby to *')

t('speaker: * to *')

t('custom mapper')

t('keep buffer list')
