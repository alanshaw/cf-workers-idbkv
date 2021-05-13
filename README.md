# cf-workers-idbkv

[![Build Status](https://travis-ci.com/alanshaw/cf-workers-idbkv.svg?branch=main)](https://travis-ci.com/alanshaw/cf-workers-idbkv)
[![dependencies Status](https://status.david-dm.org/gh/alanshaw/cf-workers-idbkv.svg)](https://david-dm.org/alanshaw/cf-workers-idbkv)

IndexedDB (IDB) backed Cloudflare workers KV store for testing.

## Install

```sh
npm install cf-workers-idbkv
```

## Usage

```js
import { IDBKV } from 'cf-workers-idbkv'

const fruits = new IDBKV('database name')

const key = 'apple:grannysmith'
const value = { name: 'Granny Smith', type: 'apple', color: 'green' }
const metadata = { name: 'Granny Smith' }

await fruits.put(key, JSON.stringify(value), { metadata })

const apple = await fruits.get(key, 'json')
console.log(apple) // { name: 'Granny Smith', type: 'apple', color: 'green' }

const apples = await fruits.list({ prefix: 'apple:' })
console.log(apples) // { keys: [{ name: 'apple:grannysmith', metadata: { name: 'Granny Smith' } }], list_complete: true }

await fruits.delete(key)
```

## API

See [Cloudflare Workers Runtime API docs](https://developers.cloudflare.com/workers/runtime-apis/kv).

## Contribute

Feel free to dive in! [Open an issue](https://github.com/alanshaw/cf-workers-idbkv/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
