
const { MultiTransformIterator, SimpleTransformIterator, scheduleTask } = require('asynciterator');

// https://en.wikipedia.org/wiki/Nested_loop_join
class NestedLoopJoin extends MultiTransformIterator
{
    constructor (left, right, funJoin, options)
    {
        super(left, options);

        this.right = right;
        this.funJoin = funJoin; // function that joins 2 elements or returns null if join is not possible
        this.on('end', () => this.right.close());
    }

    _end ()
    {
        super._end();
        scheduleTask(() => this.right.destroy());
    }

    _createTransformer (leftItem)
    {
        return new SimpleTransformIterator(this.right.clone(), { transform: (rightItem, done, push) =>
        {
            let result = this.funJoin(leftItem, rightItem);
            if (result !== null)
                push(result);
            done();
        }});
    }
}

module.exports = NestedLoopJoin;
