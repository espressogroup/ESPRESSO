
let AsyncIterator = require('asynciterator').AsyncIterator;

// https://en.wikipedia.org/wiki/Hash_join
class HashJoin extends AsyncIterator
{
    constructor (left, right, funHash, funJoin)
    {
        super();

        this.addedDataListener = false;
        this.left = left;
        this.right = right;
        this.funHash = funHash;
        this.funJoin = funJoin;

        this.leftMap = new Map();

        this.match    = null;
        this.matches  = [];
        this.matchIdx = 0;

        this.left.on('error', (error) => this.destroy(error));
        this.right.on('error', (error) => this.destroy(error));

        this.readable = false;

        this.left.on('end', allowJoining.bind(this));

        function allowJoining ()
        {
            if (this.leftMap.size <= 0)
                return this.close();
            this.readable = true;
            this.right.on('readable', () => this.readable = true);
            this.right.on('end', () => { if (!this.hasResults()) this._end(); });
        }

        this.on('newListener', (eventName) =>
        {
            if (eventName === 'data' && !this.addedDataListener)
            {
                this.addedDataListener = true;
                this._addDataListener();
            }
        })
    }

    hasResults ()
    {
        return !this.right.ended || this.matchIdx < this.matches.length;
    }

    _end ()
    {
        super._end();
        this.left.destroy();
        this.right.destroy();
    }

    read ()
    {
        if (!this.addedDataListener)
        {
            this.addedDataListener = true;
            this._addDataListener();
        }

        while(true) {
            if (this.ended || !this.readable)
                return null;

            while (this.matchIdx < this.matches.length)
            {
                let item = this.matches[this.matchIdx++];
                let result = this.funJoin(item, this.match);
                if (result !== null)
                    return result;
            }

            if (!this.hasResults())
                this._end();

            this.match = this.right.read();

            if (this.match === null)
            {
                this.readable = false;
                return null;
            }

            let hash = this.funHash(this.match);
            this.matches = this.leftMap.get(hash) || [];
            this.matchIdx = 0;
        }
    }

    _addDataListener()
    {
        this.left.on('data', addItem.bind(this));

        function addItem(item)
        {
            let hash = this.funHash(item);
            if (!this.leftMap.has(hash))
                this.leftMap.set(hash, []);
            let arr = this.leftMap.get(hash);
            arr.push(item);
        }
    }
}

module.exports = HashJoin;
