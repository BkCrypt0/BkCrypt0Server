function signatureToArray(instance) {
  return [instance.R8x, instance.R8y, instance.S]
}

module.exports = {
  signatureToArray
}