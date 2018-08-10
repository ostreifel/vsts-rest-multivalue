import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { MultiValueControl } from "./MultiValueControl";
import { searchValues } from "./searchValues";

initializeIcons();
export class MultiValueCombo {
    public readonly fieldName = VSS.getConfiguration().witInputs.FieldName;
    private readonly _container = document.getElementById("container") as HTMLElement;
    private _dropdown: number;

    public async refresh(): Promise<void> {
        ReactDOM.render(<MultiValueControl
            selected={await this._getSelected()}
            options={await this._searchValues("", [])}
            onSelectionChanged={(selected) => this._setSelected(selected)}
            width={this._container.scrollWidth}
            placeholder="No selection made"
            onBlurred={() => {
                console.log("dismiss");
                this._resize();
            }}
            onMenuOpen={() => this._resize(6)}
        />, this._container);
    }

    private async _searchValues(filter: string, selected?: string[]): Promise<string[]> {
        console.log("search values", filter);
        if (!this._dropdown) {
            this._resize(3);
        }

        const vals = await searchValues(filter, selected);
        this._resize(vals.length);

        return vals;
    }

    private async _resize(dropdown?: number) {
        console.log("resize", dropdown);
        this._dropdown = dropdown || 0;
        VSS.resize(undefined, (this._container.scrollHeight || 36) + 30 + 40 * this._dropdown);
    }

    private async _getSelected(): Promise<string[]> {
        const formService = await WorkItemFormService.getService();
        const value = await formService.getFieldValue(this.fieldName);
        if (typeof value !== "string") {
            return [];
        }
        return value.split(";").filter((v) => !!v);
    }
    private async _setSelected(values: string[]) {
        const formService = await WorkItemFormService.getService();
        const text = values.map((name) => name).join(";");
        formService.setFieldValue(this.fieldName, text);
    }
}
