import * as JSONPath from "jsonpath";
import { ITag } from "office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { CompletionDropdown } from "./CompletionDropdown";
import { callApi } from "./RestCall";

initializeIcons();
export class MultiValueCombo {
    public readonly fieldName = VSS.getConfiguration().witInputs.FieldName;
    private _suggestedValues: Promise<string[]>;

    public async refresh(): Promise<void> {

        ReactDOM.render(<CompletionDropdown
            selected={await this._getSelected()}
            resolveSuggestions={this._searchValues.bind(this)}
            onSelectionChanged={(selected) => this._setSelected(selected)}
            placeholder="No selection made"
            loadingText="Getting values..."
            onDismiss={this._resize.bind(this)}
        />, document.getElementById("container"), this._resize.bind(this));
    }

    private async _resize(dropdown?: "show drowndown") {
        if (dropdown) {
            VSS.resize(undefined, ($(".container").height() || 36) + 35 * 6);
        } else {
            VSS.resize();
        }
    }

    private async _getSelected(): Promise<ITag[]> {
        const formService = await WorkItemFormService.getService();
        const value = await formService.getFieldValue(this.fieldName);
        if (typeof value !== "string") {
            return [];
        }
        return value.split(";").filter((v) => !!v).map((name) => ({name, key: name}));
    }
    private async _setSelected(values: ITag[]) {
        const formService = await WorkItemFormService.getService();
        const text = values.map(({name}) => name).join(";");
        formService.setFieldValue(this.fieldName, text);
    }

    private async _searchValues(filter: string, selected?: ITag[]) {
        this._resize("show drowndown");
        filter = filter.toLowerCase();
        const selectedSet: {[name: string]: boolean} = {};
        for (const {name} of selected || []) {
            selectedSet[name] = true;
        }
        const values = await this._getSuggestedValues();

        const lower = (v: string) => v.toLocaleLowerCase();
        const suggested = [
            ...values.filter((v) => lower(v).indexOf(filter) === 0).filter((v) => !selectedSet.hasOwnProperty(v)),
            ...values.filter((v) => lower(v).indexOf(filter) > 0).filter((v) => !selectedSet.hasOwnProperty(v)),
        ].map((name) => ({name, key: name}));
        return suggested;
    }

    private async _getSuggestedValues(): Promise<string[]> {
        if (this._suggestedValues) {
            return this._suggestedValues;
        }
        const inputs: IDictionaryStringTo<string> = VSS.getConfiguration().witInputs;

        const url: string = inputs.Url;
        return this._suggestedValues = new Promise<string[]>((resolve, reject) =>
            callApi(url, "GET", undefined, undefined, (data) =>
                resolve(this._findArr(data)), reject));
    }
    // Convert unknown data type to string[]
    private _findArr(data: object): string[] {
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
}
