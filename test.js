'use strict';

const t = require('tape')
const remix = require('./')
const AudioBuffer = require('audio-buffer')
const util = require('audio-buffer-utils')
const AudioBufferList = require('audio-buffer-list')

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

t.skip('speaker: dolby to *', t => {
  let data0 = [0,0,0,0,0,0]

  let dataL =  [0,1,-1]
  let dataSL = [1,1,-1]
  let dataR =  [-1,1,0]
  let dataSR = [-1,-1,1]
  let dataC =  [1,1,1]
  let dataSB = [-1,-1,-1]

  //FIX this
  let dolby = new AudioBuffer(6, [dataL, dataR, dataC, dataSB, dataSL, dataSR])
  let quad = new AudioBuffer(4, [dataL, dataR, dataSL, dataSR])
  let mono = new AudioBuffer(1, [-.7071, .7071*2, ])
  let stereo = new AudioBuffer(2, [[], []])

  t.deepEqual(remix(quad, 1), mono)
  t.deepEqual(remix(quad, 2), stereo)
  t.deepEqual(remix(quad, 6), dolby)

  t.end()
})

t('speaker: * to *', t => {
  let a = AudioBuffer(3, [[1, 0, -1], [0, 1, -1], [-1, 1, 0]])

  let b = remix(a, 4)

  t.equal(b.numberOfChannels, 4)
  t.deepEqual(b.getChannelData(0), a.getChannelData(0))
  t.deepEqual(b.getChannelData(1), a.getChannelData(1))
  t.deepEqual(b.getChannelData(2), a.getChannelData(2))
  t.deepEqual(b.getChannelData(3), [0, 0, 0])

  let c = remix(a, 1)
  t.equal(c.numberOfChannels, 1)
  t.notEqual(c.getChannelData(0), a.getChannelData(0))
  t.deepEqual(c.getChannelData(0), a.getChannelData(0))

  t.end()
})

t('object mapper', t => {
  let a = AudioBuffer(2, [[1, 0, -1], [0, 1, -1]])

  //object
  let b = remix(a, {
    0: 1,
    1: null,
    2: 0,
    4: (dest, a) => {
      let left = a.getChannelData(0), right = a.getChannelData(1)
      for (let i = 0; i < a.length; i++) {
        dest[i] = .5 * (left[i] + right[i])
      }
    }
  })

  t.deepEqual(b.getChannelData(0), [0, 1, -1])
  t.deepEqual(b.getChannelData(1), [0, 0, 0])
  t.deepEqual(b.getChannelData(2), [1, 0, -1])
  t.deepEqual(b.getChannelData(3), [0, 0, 0])
  t.deepEqual(b.getChannelData(4), [.5, .5, -1])

  t.end()
})

t('array mapper', t => {
  let a = AudioBuffer(2, [[1, 0, -1], [0, 1, -1]])

  //array
  let b = remix(a, [
    1,
    null,
    0,
    ,
    (dest, a) => {
      let left = a.getChannelData(0), right = a.getChannelData(1)
      for (let i = 0; i < a.length; i++) {
        dest[i] = .5 * (left[i] + right[i])
      }
    }
  ])

  t.deepEqual(b.getChannelData(0), [0, 1, -1])
  t.deepEqual(b.getChannelData(1), [0, 0, 0])
  t.deepEqual(b.getChannelData(2), [1, 0, -1])
  t.deepEqual(b.getChannelData(3), [0, 0, 0])
  t.deepEqual(b.getChannelData(4), [.5, .5, -1])

  t.end()
})

t('keep buffer list', t => {
  let a = AudioBufferList([AudioBuffer(2, [[0,1,-1], [-1,0,1]]), AudioBuffer(2, [[0,.5,-.5], [-.5,0,.5]])])

  let b = remix(a, 1)
  t.equal(b.numberOfChannels, 1)

  let f = AudioBufferList([AudioBuffer(1, [-.5, .5, 0]), AudioBuffer(1, [-.25, .25, 0])])

  t.ok(b.slice)
  t.deepEqual(b.getChannelData(0), f.getChannelData(0))
  t.equal(b.numberOfChannels, f.numberOfChannels)

  t.end()
})
