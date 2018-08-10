import * as JSONPath from "jsonpath";
import { callApi } from "./RestCall";

let _suggestedValues: Promise<string[]>;
export async function searchValues(filter: string, selected?: string[]): Promise<string[]> {
    filter = filter.toLowerCase();
    const selectedSet: {[name: string]: boolean} = {};
    for (const name of selected || []) {
        selectedSet[name] = true;
    }
    const values = await _getSuggestedValues();

    const lower = (v: string) => v.toLocaleLowerCase();
    const suggested = [
        ...values.filter((v) => lower(v).indexOf(filter) >= 0).filter((v) => !selectedSet.hasOwnProperty(v)),
    ];
    return suggested;
}

async function _getSuggestedValues(): Promise<string[]> {
    if (_suggestedValues) {
        return _suggestedValues;
    }
    const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;

    const url: string = inputs.Url;
    return _suggestedValues = new Promise<string[]>((resolve, reject) =>
        callApi(url, "GET", undefined, undefined, (data) =>
            resolve(_findArr(data)), reject)).then(makeUnique);
}

function makeUnique(vals: string[]): string[] {
    const vMap: {[key: string]: boolean} = {};
    return vals.filter((v) => {
        const include = !vMap[v];
        vMap[v] = true;
        return include;
    });
}
// Convert unknown data type to string[]
function _findArr(data: object): string[] {
    const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;
    const property: string = inputs.Property;
    if (property && property[0] === "$") {
        return JSONPath.query(data, property);
    }
    // Look for an array: object itself or one of its properties
    const objs: object[] = [data];
    for (let obj = objs.shift(); obj; obj = objs.shift()) {
        if (Array.isArray(obj)) {
            // If configuration has a the Property property set then map from objects to strings
            // Otherwise assume already strings
            return property ? obj.map((o) => o[property]) : obj;
        } else if (typeof obj === "object") {
            for (const key in obj) {
                objs.push(obj[key]);
            }
        }
    }
    return [];
}
