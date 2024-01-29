// TODO: handle entry point for smart embed
const { SmartEmbedOpenAIAdapter } = require('./SmartEmbedOpenAIAdapter');
const { SmartEmbedTransformersNodeAdapter } = require('./SmartEmbedTransformersNodeAdapter');
const { SmartEmbedTransformersWebAdapter } = require('./SmartEmbedTransformersWebAdapter');
exports.SmartEmbedOpenAIAdapter = SmartEmbedOpenAIAdapter;
exports.SmartEmbedTransformersNodeAdapter = SmartEmbedTransformersNodeAdapter;
exports.SmartEmbedTransformersWebAdapter = SmartEmbedTransformersWebAdapter;