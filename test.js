
const test = require('ava');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { SmartEmbedTransformersNodeAdapter } = require('smart-embed');
test('SmartEmbedTransformersNodeAdapter.embed(input)-> returns an object with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedTransformersNodeAdapter.create("TaylorAI/bge-micro-v2");
  const resp = await smart_embed.embed("test");
  t.is(resp.tokens, 3);
  t.is(resp.vec.length, 384);
});
test('SmartEmbedTransformersNodeAdapter.embed_batch(items)-> returns an array of objects with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedTransformersNodeAdapter.create("TaylorAI/bge-micro-v2");
  const test_items = [
    { embed_input: "test" },
    { embed_input: "test" },
  ];
  const resp = await smart_embed.embed_batch(test_items);
  // console.log(resp);
  t.is(resp[0].tokens, 3);
  t.is(resp[0].vec.length, 384);
  t.is(resp[1].tokens, 3);
  t.is(resp[1].vec.length, 384);
});
const { SmartEmbedOpenAIAdapter } = require('smart-embed');
test('SmartEmbedOpenAIAdapter.embed(input)-> returns an object with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedOpenAIAdapter.create("text-embedding-3-small-512", fetch, process.env.OPENAI_API_KEY, { url_first: true });
  const resp = await smart_embed.embed("test");
  t.is(resp.tokens, 1);
  t.is(resp.vec.length, 512);
});
test('SmartEmbedOpenAIAdapter.embed_batch(items)-> returns an array of objects with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedOpenAIAdapter.create("text-embedding-3-small-512", fetch, process.env.OPENAI_API_KEY, { url_first: true });
  const test_items = [
    { embed_input: "test" },
    { embed_input: "test" },
  ];
  const resp = await smart_embed.embed_batch(test_items);
  // console.log(resp);
  t.is(resp[0].tokens, 1);
  t.is(resp[0].vec.length, 512);
  t.is(resp[1].tokens, 1);
  t.is(resp[1].vec.length, 512);
});