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

    public async refresh(): Promise<void> {
        const selected = await this._getSelected();
        ReactDOM.render(<MultiValueControl
            selected={selected}
            options={await searchValues("", [])}
            onSelectionChanged={this._setSelected}
            width={this._container.scrollWidth}
            placeholder={selected.length ? "" : "No selection made"}
            onResize={() => VSS.resize()}
        />, this._container, () => VSS.resize());
    }

    private async _getSelected(): Promise<string[]> {
        const formService = await WorkItemFormService.getService();
        const value = await formService.getFieldValue(this.fieldName);
        if (typeof value !== "string") {
            return [];
        }
        return value.split(";").filter((v) => !!v);
    }
    private _setSelected = async (values: string[]) => {
        const formService = await WorkItemFormService.getService();
        const text = values.map((name) => name).join(";");
        formService.setFieldValue(this.fieldName, text);
    }
}
