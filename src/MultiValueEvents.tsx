import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { getSuggestedValues } from "./getSuggestedValues";
import { MultiValueControl } from "./MultiValueControl";

initializeIcons();
export class MultiValueCombo {
    public readonly fieldName = VSS.getConfiguration().witInputs.FieldName;
    private readonly _container = document.getElementById("container") as HTMLElement;
    private _onRefreshed: () => void;

    public async refresh(): Promise<void> {
        const selected = await this._getSelected();
        ReactDOM.render(<MultiValueControl
            selected={selected}
            options={await getSuggestedValues()}
            onSelectionChanged={this._setSelected}
            width={this._container.scrollWidth}
            placeholder={selected.length ? "Click to Add" : "No selection made"}
            onResize={() => VSS.resize()}
        />, this._container, () => {
            VSS.resize();
            if (this._onRefreshed) {
                this._onRefreshed();
            }
        });
    }

    private async _getSelected(): Promise<string[]> {
        const formService = await WorkItemFormService.getService();
        const value = await formService.getFieldValue(this.fieldName);
        if (typeof value !== "string") {
            return [];
        }
        return value.split(";").filter((v) => !!v);
    }
    private _setSelected = async (values: string[]): Promise<void> => {
        const formService = await WorkItemFormService.getService();
        const text = values.map((name) => name).join(";");
        formService.setFieldValue(this.fieldName, text);
        return new Promise<void>((resolve) => {
            this._onRefreshed = resolve;
        })
    }
}
