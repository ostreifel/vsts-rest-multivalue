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
    idx: number;
    filter: "";
}

export class MultiValueControl extends React.Component<IMultiValueControlProps, IMultiValueControlState> {
    private _setUnfocused = new DelayedFunction(null, 1, "", () => {
        this.setState({focused: false, idx: 0});
    });
    constructor(props, context) {
        super(props, context);
        this.state = { focused: false, idx: 0, filter: "" };
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
                    onKeyDown={this._onInputKeyDown}
                />
                {options.map((o, i) => <Checkbox
                    className={`${i === idx || (i + 1 === options.length && idx > options.length) ? "hover" : ""}`}
                    checked={selected.indexOf(o) >= 0}
                    inputProps={{
                        onBlur: this._onBlur,
                        onFocus: this._onFocus,
                    }}
                    onChange={() => this._toggleOption(o)}
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
    private _onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.shiftKey || e.altKey || e.ctrlKey) {
            return;
        }
        switch (e.which) {
            case 38: // up
            if (this.state.idx > 0) {
                this.setState({idx: this.state.idx - 1});
            }
            e.preventDefault();
            e.stopPropagation();
            break;
            case 40: // down
            if (this.state.idx + 1 < this.props.options.length) {
                this.setState({idx: this.state.idx + 1});
            }
            e.preventDefault();
            e.stopPropagation();
            break;
            case 13: // enter
            const opts = this.props.options;
            if (opts.length > 0) {
                this._toggleOption(opts[Math.min(this.state.idx, opts.length - 1)]);
            }
            break;
        }
    }
    private _onBlur = () => {
        this._setUnfocused.reset();
    }
    private _onFocus = () => {
        this._setUnfocused.cancel();
    }
    private _toggleOption = (option: string) => {
        if (!this.props.onSelectionChanged) {
            return;
        }
        const selectedMap: {[k: string]: boolean} = {};
        for (const s of this.props.selected || []) {
            selectedMap[s] = true;
        }
        selectedMap[option] = !selectedMap[option];
        const selected = this.props.options.filter((o) => selectedMap[o]);
        this.props.onSelectionChanged(selected);
    }
    private _onTagsChanged = (tags: ITag[]) => {
        const values = tags.map(({name}) => name);
        if (this.props.onSelectionChanged) {
            this.props.onSelectionChanged(values);
        }
    }
}
