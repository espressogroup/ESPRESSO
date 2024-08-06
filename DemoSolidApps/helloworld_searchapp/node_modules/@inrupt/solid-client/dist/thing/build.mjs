import { addStringWithLocale, addUrl, addIri, addBoolean, addDatetime, addDate, addTime, addDecimal, addInteger, addStringNoLocale, addNamedNode, addLiteral, addTerm } from './add.mjs';
import { removeAll, removeStringWithLocale, removeUrl, removeIri, removeBoolean, removeDatetime, removeDate, removeTime, removeDecimal, removeInteger, removeStringNoLocale, removeNamedNode, removeLiteral } from './remove.mjs';
import { setStringWithLocale, setUrl, setIri, setBoolean, setDatetime, setDate, setTime, setDecimal, setInteger, setStringNoLocale, setNamedNode, setLiteral, setTerm } from './set.mjs';
import { isThing, createThing } from './thing.mjs';

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * Create or modify a [[Thing]], setting multiple properties in a single expresssion.
 *
 * For example, you can create a new Thing and initialise several properties as follows:
 *
 *     const me = buildThing()
 *       .addUrl(rdf.type, schema.Person)
 *       .addStringNoLocale(schema.givenName, "Vincent")
 *       .build();
 *
 * Take note of the final call to `.build()` to obtain the actual Thing.
 *
 * @param init Optionally pass an existing [[Thing]] to modify the properties of. If left empty, `buildThing` will initialise a new Thing.
 * @returns a [[ThingBuilder]], a Fluent API that allows you to set multiple properties in a single expression.
 * @since 1.9.0
 */
function buildThing(init = createThing()) {
    let thing = isThing(init) ? init : createThing(init);
    function getAdder(adder) {
        return (property, value) => {
            thing = adder(thing, property, value);
            return builder;
        };
    }
    function getSetter(setter) {
        return (property, value) => {
            thing = setter(thing, property, value);
            return builder;
        };
    }
    function getRemover(remover) {
        return (property, value) => {
            thing = remover(thing, property, value);
            return builder;
        };
    }
    const builder = {
        build: () => thing,
        addUrl: getAdder(addUrl),
        addIri: getAdder(addIri),
        addBoolean: getAdder(addBoolean),
        addDatetime: getAdder(addDatetime),
        addDate: getAdder(addDate),
        addTime: getAdder(addTime),
        addDecimal: getAdder(addDecimal),
        addInteger: getAdder(addInteger),
        addStringNoLocale: getAdder(addStringNoLocale),
        addStringEnglish: (property, value) => {
            thing = addStringWithLocale(thing, property, value, "en");
            return builder;
        },
        addStringWithLocale: (property, value, locale) => {
            thing = addStringWithLocale(thing, property, value, locale);
            return builder;
        },
        addNamedNode: getAdder(addNamedNode),
        addLiteral: getAdder(addLiteral),
        addTerm: getAdder(addTerm),
        setUrl: getSetter(setUrl),
        setIri: getSetter(setIri),
        setBoolean: getSetter(setBoolean),
        setDatetime: getSetter(setDatetime),
        setDate: getSetter(setDate),
        setTime: getSetter(setTime),
        setDecimal: getSetter(setDecimal),
        setInteger: getSetter(setInteger),
        setStringNoLocale: getSetter(setStringNoLocale),
        setStringEnglish: (property, value) => {
            thing = setStringWithLocale(thing, property, value, "en");
            return builder;
        },
        setStringWithLocale: (property, value, locale) => {
            thing = setStringWithLocale(thing, property, value, locale);
            return builder;
        },
        setNamedNode: getSetter(setNamedNode),
        setLiteral: getSetter(setLiteral),
        setTerm: getSetter(setTerm),
        removeAll: (property) => {
            thing = removeAll(thing, property);
            return builder;
        },
        removeUrl: getRemover(removeUrl),
        removeIri: getRemover(removeIri),
        removeBoolean: getRemover(removeBoolean),
        removeDatetime: getRemover(removeDatetime),
        removeDate: getRemover(removeDate),
        removeTime: getRemover(removeTime),
        removeDecimal: getRemover(removeDecimal),
        removeInteger: getRemover(removeInteger),
        removeStringNoLocale: getRemover(removeStringNoLocale),
        removeStringEnglish: (property, value) => buildThing(removeStringWithLocale(thing, property, value, "en")),
        removeStringWithLocale: (property, value, locale) => buildThing(removeStringWithLocale(thing, property, value, locale)),
        removeNamedNode: getRemover(removeNamedNode),
        removeLiteral: getRemover(removeLiteral),
    };
    return builder;
}

export { buildThing };
