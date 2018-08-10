import { Checkbox } from "office-ui-fabric-react/lib/components/Checkbox";
import { ITag, TagPicker } from "office-ui-fabric-react/lib/components/pickers";
import { TextField } from "office-ui-fabric-react/lib/components/TextField";
import * as React from "react";
import { DelayedFunction } from "VSS/Utils/Core";

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
    onResize?: () => void;
}

interface IMultiValueControlState {
    focused: boolean;
    idx: 0;
}

export class MultiValueControl extends React.Component<IMultiValueControlProps, IMultiValueControlState> {
    private _setUnfocused = new DelayedFunction(null, 1, "", () => {
        this.setState({focused: false, idx: 0});
    });
    constructor(props, context) {
        super(props, context);
        this.state = { focused: false, idx: 0 };
    }
    public render() {
        if (this.state.focused) {
            const options = this.props.options;
            const selected = this.props.selected || [];
            const {idx} = this.state;
            return <div className="multi-value-control options">
                <TextField value={selected.join(";") + (selected.length > 0 ? ";" : "")}
                    autoFocus
                    onBlur={this._onBlur}
                    onFocus={this._onFocus}
                />
                {options.map((o, i) => <Checkbox
                    className={`${i === idx || (i + 1 === options.length && idx > options.length) ? "hover" : ""}`}
                    checked={selected.indexOf(o) >= 0}
                    inputProps={{
                        onBlur: this._onBlur,
                        onFocus: this._onFocus,
                    }}
                    label={o}
                />)}
            </div>;
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
    public componentDidUpdate() {
        if (this.props.onResize) {
            this.props.onResize();
        }
    }
    private _onBlur = () => {
        this._setUnfocused.reset();
    }
    private _onFocus = () => {
        this._setUnfocused.cancel();
    }
    private _onTagsChanged = (tags: ITag[]) => {
        const values = tags.map(({name}) => name);
        if (this.props.onSelectionChanged) {
            this.props.onSelectionChanged(values);
        }
    }
}
