'use strict';

const t = require('tape')
const remix = require('./')
const AudioBuffer = require('audio-buffer')


t('interpretation: discrete', t => {
  for (let from = 1; from <= 32; from++) {
    for (let to = 1; to <= 32; to++) {
      let a = AudioBuffer(from, 1024)
      let b = remix(a, to)

      t.equal(b.numberOfChannels, to)
    }
  }

  t.end()
})
