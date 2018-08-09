import { ITag } from "office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { DelayedFunction } from "VSS/Utils/Core";
import { CompletionDropdown } from "./CompletionDropdown";
import { searchValues } from "./searchValues";

initializeIcons();
export class MultiValueCombo {
    public readonly fieldName = VSS.getConfiguration().witInputs.FieldName;
    private readonly _container = document.getElementById("container") as HTMLElement;
    private readonly _throttledRefresh = new DelayedFunction(null, 200, "resize", () => {
        console.log("resizing", this._isDropdownVisible);
        if (this._isDropdownVisible) {
            VSS.resize(undefined, (this._container.scrollHeight || 36) + 35 * 6);
        } else {
            VSS.resize();
        }
    });
    private _isDropdownVisible: boolean;

    public async refresh(): Promise<void> {
        ReactDOM.render(<CompletionDropdown
            selected={await this._getSelected()}
            resolveSuggestions={(this._searchValues.bind(this))}
            onSelectionChanged={(selected) => this._setSelected(selected)}
            width={this._container.scrollWidth}
            placeholder="No selection made"
            loadingText="Getting values..."
            onDismiss={console.log.bind(console, "dismiss")}
        />, this._container);
    }

    private async _searchValues(filter: string, selected?: ITag[]) {
        console.log("search values", filter);
        this._resize("show drowndown");
        return searchValues(filter, selected);
    }

    private async _resize(dropdown?: "show drowndown") {
        if (dropdown) {
            this._isDropdownVisible = true;
            this._throttledRefresh.invokeNow();
        } else {
            this._isDropdownVisible = false;
            this._throttledRefresh.reset();
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
}
