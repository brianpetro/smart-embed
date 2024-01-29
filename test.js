
const test = require('ava');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { SmartEmbedBgeSmallNode } = require('../smart-embed/smart_embed');
test('SmartEmbedBgeSmallNode.embed(input)-> returns an object with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedBgeSmallNode.create();
  const resp = await smart_embed.embed("test");
  t.is(resp.tokens, 3);
  t.is(resp.vec.length, 384);
});
test('SmartEmbedBgeSmallNode.embed_batch(items)-> returns an array of objects with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedBgeSmallNode.create();
  const test_items = [
    { embed_input: "test" },
    { embed_input: "test" },
  ];
  const resp = await smart_embed.embed_batch(test_items);
  console.log(resp);
  t.is(resp[0].tokens, 3);
  t.is(resp[0].vec.length, 384);
  t.is(resp[1].tokens, 3);
  t.is(resp[1].vec.length, 384);
});
const { SmartEmbedAdaApi } = require('../smart-embed/smart_embed');
test('SmartEmbedAdaApi.embed(input)-> returns an object with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedAdaApi.create(fetch, process.env.OPENAI_API_KEY, { url_first: true });
  const resp = await smart_embed.embed("test");
  t.is(resp.tokens, 1);
  t.is(resp.vec.length, 1536);
});
test('SmartEmbedAdaApi.embed_batch(items)-> returns an array of objects with tokens and vec', async (t) => {
  const smart_embed = await SmartEmbedAdaApi.create(fetch, process.env.OPENAI_API_KEY, { url_first: true });
  const test_items = [
    { embed_input: "test" },
    { embed_input: "test" },
  ];
  const resp = await smart_embed.embed_batch(test_items);
  console.log(resp);
  t.is(resp[0].tokens, 1);
  t.is(resp[0].vec.length, 1536);
  t.is(resp[1].tokens, 1);
  t.is(resp[1].vec.length, 1536);
});