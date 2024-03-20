// TODO: handle entry point for smart embed
const { SmartEmbedOpenAIAdapter } = require('./SmartEmbedOpenAIAdapter');
const { SmartEmbedTransformersNodeAdapter } = require('./SmartEmbedTransformersNodeAdapter');
const { SmartEmbedTransformersWebAdapter } = require('./SmartEmbedTransformersWebAdapter');
const { SmartEmbed } = require('./SmartEmbed');
const models = require('./models');
exports.SmartEmbedOpenAIAdapter = SmartEmbedOpenAIAdapter;
exports.SmartEmbedTransformersNodeAdapter = SmartEmbedTransformersNodeAdapter;
exports.SmartEmbedTransformersWebAdapter = SmartEmbedTransformersWebAdapter;
exports.SmartEmbed = SmartEmbed;
exports.models = models;