import { Metadata, Step, ShoppingList, ImageURLOptions } from './types';
import Parser from './Parser';

/**
 * Creates a URL for an image of the the supplied recipe.
 * 
 * @example
 * ```typescript
 * getImageURL('Baked Potato', { extension: 'jpg', step: 2 });
 * // returns "Baked Potato.2.jpg"
 * ```
 * 
 * @param name Name of the .cook file.
 * @param options The URL options.
 * @returns The image URL for the givin recipe and step.
 * 
 * @see {@link https://cooklang.org/docs/spec/#adding-pictures|Cooklang Pictures Specification}
 */
export function getImageURL(name: string, options?: ImageURLOptions) {
    options ??= {};
    return name + (options.step ? '.' + options.step : '') + '.' + (options.extension || 'png');
}

export class Recipe {
    metadata: Metadata = {};
    steps: Array<Step> = [];
    shoppingList: ShoppingList = {};
    parser: Parser;

    /**
     * Creates a new recipe from the supplied Cooklang string.
     * 
     * @param source The Cooklang string to parse. If `source` is ommited, an empty recipe is created.
     * 
     * @see {@link https://cooklang.org/docs/spec/#the-cook-recipe-specification|Cooklang Recipe Specification}
     */
    constructor(source?: string) {
        this.parser = new Parser();

        if (source) {
            Object.assign(this, this.parser.parse(source));
        }
    }

    /**
     * Generates a Cooklang string from the recipes metadata, steps, and shopping lists.
     * __NOTE: Any comments will be lost.__
     * 
     * @returns The generated Cooklang string.
     */
    toCooklang(): string {
        let metadataStr = '';
        let stepStrs = [];
        let shoppingListStrs = [];

        for (let [key, value] of Object.entries(this.metadata)) {
            metadataStr += `>> ${key}: ${value}\n`;
        }

        for (let step of this.steps) {
            let stepStr = '';

            for (let item of step) {
                if ('value' in item) {
                    stepStr += item.value;
                } else {
                    if (item.type == 'ingredient') stepStr += '@';
                    else if (item.type == 'cookware') stepStr += '#';
                    else stepStr += '~';

                    stepStr += item.name;

                    stepStr += '{';
                    if (item.quantity) stepStr += item.quantity;
                    if ('units' in item && item.units) stepStr += '%' + item.units;
                    stepStr += '}';
                }
            }

            stepStrs.push(stepStr);
        }

        for (let [category, items] of Object.entries(this.shoppingList)) {
            let shoppingListStr = '';

            shoppingListStr += category + '\n';
            shoppingListStr += items.map(x => x.name + (x.synonym ? '|' + x.synonym : '')).join('\n');

            shoppingListStrs.push(shoppingListStr);
        }

        return [metadataStr, stepStrs.join('\n\n'), shoppingListStrs.join('\n\n')].join('\n');
    }

    toJSON(): string {
        return JSON.stringify({ metadata: this.metadata, steps: this.steps });
    }
}

export * from './types';