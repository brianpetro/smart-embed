// TODO: handle entry point for smart embed
const { SmartEmbedOpenAIAdapter } = require('./SmartEmbedOpenAIAdapter');
const { SmartEmbedTransformersNodeAdapter } = require('./SmartEmbedTransformersNodeAdapter');
const { SmartEmbedTransformersWebAdapter } = require('./SmartEmbedTransformersWebAdapter');
const { SmartEmbed } = require('./SmartEmbed');
exports.SmartEmbedOpenAIAdapter = SmartEmbedOpenAIAdapter;
exports.SmartEmbedTransformersNodeAdapter = SmartEmbedTransformersNodeAdapter;
exports.SmartEmbedTransformersWebAdapter = SmartEmbedTransformersWebAdapter;
exports.SmartEmbed = SmartEmbed;