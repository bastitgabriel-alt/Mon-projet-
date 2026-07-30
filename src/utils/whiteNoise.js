// Bruit blanc synthétisé (Web Audio API) pour la routine du soir — pas un
// fichier audio de pluie/nature (on ne fabrique pas un faux enregistrement),
// mais un vrai bruit blanc généré, ce qui est honnête : c'est littéralement
// du signal aléatoire, pas une prétention à un son "réel" enregistré.
let audioCtx = null
let source = null
let gainNode = null

export function startWhiteNoise() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const bufferSize = 2 * audioCtx.sampleRate
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  gainNode = audioCtx.createGain()
  gainNode.gain.value = 0.12
  source.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  source.start()
}

export function stopWhiteNoise() {
  if (source) {
    source.stop()
    source.disconnect()
  }
  if (gainNode) gainNode.disconnect()
  if (audioCtx) audioCtx.close()
  audioCtx = null
  source = null
  gainNode = null
}
