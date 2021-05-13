import { KV, ValueAndMeta } from 'cf-workers-kv'
import { AsyncMapLike } from 'async-map-like'
// @ts-ignore
import IdbKvStore from 'idb-kv-store'
import Fifo from 'p-fifo'

class IDBBackend implements AsyncMapLike<string, ValueAndMeta> {
  private readonly idb: IdbKvStore
  constructor (name: string) {
    this.idb = new IdbKvStore(name)
  }
  clear(): Promise<void> {
    return this.idb.clear()
  }
  delete(key: string): Promise<boolean> {
    return this.idb.remove(key)
  }
  async forEach(callbackfn: (value: ValueAndMeta, key: string, map: Map<string, ValueAndMeta>) => void, thisArg?: any): Promise<void> {
    for await (const [k, v] of toIterable(this.idb)) {
      // @ts-ignore
      callbackfn.call(thisArg, v, k, this)
    }
  }
  get(key: string): Promise<ValueAndMeta | undefined> {
    return this.idb.get(key)
  }
  async has(key: string) {
    const v = await this.idb.get(key)
    return v !== undefined
  }
  async set(key: string, value: ValueAndMeta): Promise<AsyncMapLike<string, ValueAndMeta>> {
    await this.idb.set(key, value)
    return this
  }
  get size () {
    return this.idb.count()
  }
  async * entries(): AsyncIterableIterator<[string, ValueAndMeta]> {
    for await (const entry of toIterable(this.idb)) {
      yield entry
    }
  }
  async * keys(): AsyncIterableIterator<string> {
    for await (const entry of toIterable(this.idb)) {
      yield entry[0]
    }
  }
  async * values(): AsyncIterableIterator<ValueAndMeta> {
    for await (const entry of toIterable(this.idb)) {
      yield entry[1]
    }
  }
  close(): Promise<void> {
    return this.idb.close()
  }
}

async function * toIterable (idb: IdbKvStore) {
  let done = false
  const q = new Fifo<[string, ValueAndMeta] | Error | true>()
  type Cursor = { continue: Function, key: string, value: ValueAndMeta }
  const txn = idb.iterator(async (err: Error, cursor: Cursor) => {
    if (err || !cursor) {
      done = true
      return q.push(err || done)
    }
    await q.push([cursor.key, cursor.value])
    cursor.continue()
  })
  try {
    while (true) {
      const val = await q.shift()
      if (val instanceof Error) throw val
      if (val === true) return
      yield val
    }
  } finally {
    if (!done) txn.abort()
  }
}

export class IDBKV extends KV {
  private readonly backend: IDBBackend
  constructor (name: string) {
    const be = new IDBBackend(name)
    super(be)
    this.backend = be
  }
  clear () {
    return this.backend.clear()
  }
  close () {
    return this.backend.close()
  }
}
