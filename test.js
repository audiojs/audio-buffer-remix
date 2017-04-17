'use strict';

const t = require('tape')
const remix = require('./')
const AudioBuffer = require('audio-buffer')


t('channel combinations', t => {
  for (let from = 1; from <= 32; from++) {
    for (let to = 1; to <= 32; to++) {
      let a = AudioBuffer(from, 1024)
      let b = remix(a, to)

      t.equal(b.numberOfChannels, to)
    }
  }

  t.end()
})

t('interpretation: discrete', t => {
  t.end()
})

t.only('speaker: mono to *', t => {
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


t.only('speaker: stereo to *', t => {
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


t('custom mapper')

t('keep buffer list')
