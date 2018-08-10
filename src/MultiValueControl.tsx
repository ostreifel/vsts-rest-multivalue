import {
    ComboBox, IComboBoxOption,
} from "office-ui-fabric-react/lib/components/ComboBox";
import { ITag, TagPicker } from "office-ui-fabric-react/lib/components/pickers";
import * as React from "react";

interface IMultiValueControlProps {
    selected?: string[];
    width?: number;
    readOnly?: boolean;
    placeholder?: string;
    noResultsFoundText?: string;
    searchingText?: string;
    onSelectionChanged?: (selection: string[]) => void;
    forceValue?: boolean;
    options: string[];
    onBlurred?: () => void;
    onMenuOpen?: () => void;
}

interface IMultiValueControlState {
    focused: boolean;
}

export class MultiValueControl extends React.Component<IMultiValueControlProps, IMultiValueControlState> {
    private _comboBox: React.RefObject<ComboBox> = React.createRef<ComboBox>();
    constructor(props, context) {
        super(props, context);
        this.state = { focused: false };
    }
    public render() {
        console.log("rendering", this.props, this.state);
        if (this.state.focused) {
            return <ComboBox
                allowFreeform
                multiSelect
                ref={this._comboBox}
                className="multi-value-control combo-box"
                options={this._getOptions()}
                selectedKey={this.props.selected}
                onBlur={this._onBlur}
                onMenuDismissed={this._onDismissed}
                onMenuOpen={this.props.onMenuOpen}
                dropdownWidth={this.props.width}
                onChanged={this._onChanged}
            />;
        } else {
            return <TagPicker
                className="multi-value-control tag-picker"
                selectedItems={(this.props.selected || []).map((t) => ({ key: t, name: t }))}
                inputProps={{
                    placeholder: this.props.placeholder,
                    readOnly: this.props.readOnly,
                    width: this.props.width || 200,
                    onFocus: () => this.setState({ focused: true }),
                }}
                onChange={this._onTagsChanged}
                onResolveSuggestions={() => []}
            />;
        }
    }
    public componentDidUpdate(prevProps: IMultiValueControlProps, state: IMultiValueControlState) {
        if (this.state.focused && !state.focused && this._comboBox.current) {
            console.log("combo", this._comboBox.current.focus, this._comboBox.current);
            const input = (document.querySelector("#container input") as HTMLInputElement);
            $(input).click();
        }
    }
    private _onBlur = () => {
        if (this.props.onBlurred) {
            this.props.onBlurred();
        }
        this.setState({focused: false});
    }
    private _onDismissed = () => {
        (document.querySelector("#container input") as HTMLInputElement).click();
    }
    private _onTagsChanged = (tags: ITag[]) => {
        const values = tags.map(({name}) => name);
        if (this.props.onSelectionChanged) {
            this.props.onSelectionChanged(values);
        }
    }
    private _onChanged = (option: IComboBoxOption, _index: number, value: string) => {
        if (option !== undefined) {
            const selectedKeys = [...(this.props.selected || [])];
            if (selectedKeys && option) {
            const index = selectedKeys.indexOf(option.key as string);
            if (option.selected && index < 0) {
              selectedKeys.push(option.key as string);
            } else {
              selectedKeys.splice(index, 1);
            }
            if (this.props.onSelectionChanged) {
                this.props.onSelectionChanged(selectedKeys);
            }
          }
        }
    }
    private _getOptions = (): IComboBoxOption[] => {
        const values = this.props.options;
        const selected: { [key: string]: boolean } = {};
        for (const v of this.props.selected || []) {
            selected[v] = true;
        }

        return values.map((v) => ({
            key: v,
            text: v,
            selected: !!selected[v],
        }));
    }
}
