import * as Controls from "VSS/Controls";
import {
    EDisplayControlType,
    IdentityDisplayControl,
    IdentityPickerControlSize,
    IdentityPickerSearchControl,
    IIdentityPickerSearchOptions,
} from "VSS/Identities/Picker/Controls";
import Identities_RestClient = require("VSS/Identities/Picker/RestClient");
import Identities_Services = require("VSS/Identities/Picker/Services");
import * as Utils_Array from "VSS/Utils/Array";

import { BaseMultiValueControl } from "./BaseMultiValueControl";

export class IdentityPicker extends BaseMultiValueControl {
    /**
     * The identity control
     */
    private _identityPicker: IdentityPickerSearchControl;
    private _searchControlContainer: JQuery;
    private _identityListContainer: JQuery;
    private _identitiesList: string[];

    public initialize(): void {
        this.containerElement.addClass("identity-picker-container");
        this._searchControlContainer = $("<div>").addClass("search-control-container").appendTo(this.containerElement);
        this._identityListContainer = $("<div>").addClass("identity-list-container").appendTo(this.containerElement);
        this._identitiesList = [];

        const options: IIdentityPickerSearchOptions = {
            operationScope: {
                IMS: true,
                Source: true,
            },
            identityType: <Identities_Services.IEntityType> {
                User: true,
                Group: true,
            },
            loadOnCreate: true,
            highlightResolved: true,
            size: IdentityPickerControlSize.Small,
            dropdownSize: IdentityPickerControlSize.Medium,
            callbacks: {
                onItemSelect: (entity: Identities_RestClient.IEntity) => {
                    this._identityPicker.clear();
                    this._createIdentityViewControl(this._getIdentityIdentifier(entity));
                    this.flush();
                },
            },
        };
        this._identityPicker = <IdentityPickerSearchControl> Controls.BaseControl.createIn(
            IdentityPickerSearchControl, this._searchControlContainer, options);
        super.initialize();
    }

    public clear(): void {
        this._identityPicker.clear();
        this._identityListContainer.empty();
        this._identitiesList = [];
    }

    protected getValue(): string {
        if (this._identitiesList && this._identitiesList.length > 0) {
            return this._identitiesList.join(";");
        } else {
            return "";
        }
    }

    protected setValue(value: string): void {
        this.clear();
        const identifiers = value ? value.split(";") : [];
        $.each(identifiers, (i: number, identifier: string) => {
            this._createIdentityViewControl(identifier);
        });
    }

    private _getIdentityIdentifier(identity: Identities_RestClient.IEntity) {
        return this._getUniqueName(identity) || identity.localId || identity.originId;
    }

    private _getUniqueName(identity: Identities_RestClient.IEntity) {
        const mail = identity.signInAddress || identity.mail;

        if (mail && mail.indexOf("@") !== -1) {
            return mail;
        } else if (mail && identity.scopeName) {
            return `${identity.scopeName}\\${mail}`;
        }
        return "";
    }

    private _createIdentityViewControl(identifier: string) {
        if (this._identitiesList.indexOf(identifier) === -1) {
            const container = $("<div>").addClass("identity-container").appendTo(this._identityListContainer);

            const control = Controls.BaseControl.createIn(IdentityDisplayControl, container, {
                item: identifier,
                size: IdentityPickerControlSize.Small,
                displayType: EDisplayControlType.AvatarText,
                turnOffHover: true,
            }) as IdentityDisplayControl;

            const removeButton = $("<span>").addClass("remove-identity bowtie-icon bowtie-edit-delete").click(() => {
                Utils_Array.remove(this._identitiesList, identifier);
                control.dispose();
                container.remove();
                this.flush();
            }).appendTo(container);

            this._identitiesList.push(identifier);
        }
    }
}
