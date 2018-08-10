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
    filter: string;
}

export class MultiValueControl extends React.Component<IMultiValueControlProps, IMultiValueControlState> {
    private _setUnfocused = new DelayedFunction(null, 1, "", () => {
        this.setState({focused: false, idx: 0, filter: ""});
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
                <TextField value={selected.join(";") + (selected.length > 0 ? ";" : "") + this.state.filter}
                    autoFocus
                    onBlur={this._onBlur}
                    onFocus={this._onFocus}
                    onKeyDown={this._onInputKeyDown}
                    onChange={this._onInputChange}
                />
                {this._filteredOptions()
                .map((o, i) => <Checkbox
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
    private _filteredOptions = () => {
        const filter = this.state.filter.toLocaleLowerCase();
        const opts = this.props.options;
        return [
            ...opts.filter((o) => o.toLocaleLowerCase().indexOf(filter) === 0),
            ...opts.filter((o) => o.toLocaleLowerCase().indexOf(filter) > 0),
        ];
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
            const opts = this._filteredOptions();
            if (opts.length > 0) {
                if (this._toggleOption(opts[Math.min(this.state.idx, opts.length - 1)])) {
                    this.setState({filter: ""});
                }
            }
            break;
        }
    }
    private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            this._setSelected([]);
            return;
        }
        const optionsMap: {[k: string]: boolean} = {};
        for (const o of this.props.options) {
            optionsMap[o] = true;
        }
        const inputOpts = newValue.split(";").map((s) => s.trim()).filter((s) => !!s);
        const selected = inputOpts.filter((o) => optionsMap[o]);
        this._setSelected(selected);
        const [filter] = inputOpts.filter((o) => !optionsMap[o]).reverse();
        this.setState({filter: filter || ""});
    }
    private _onBlur = () => {
        this._setUnfocused.reset();
    }
    private _onFocus = () => {
        this._setUnfocused.cancel();
    }
    private _setSelected = (selected: string[]) => {
        if (!this.props.onSelectionChanged) {
            return;
        }
        this.props.onSelectionChanged(selected);
    }
    private _toggleOption = (option: string): boolean => {
        const selectedMap: {[k: string]: boolean} = {};
        for (const s of this.props.selected || []) {
            selectedMap[s] = true;
        }
        const change = option in selectedMap || this.props.options.indexOf(option) >= 0;
        selectedMap[option] = !selectedMap[option];
        const selected = this.props.options.filter((o) => selectedMap[o]);
        this._setSelected(selected);
        return change;
    }
    private _onTagsChanged = (tags: ITag[]) => {
        const values = tags.map(({name}) => name);
        if (this.props.onSelectionChanged) {
            this.props.onSelectionChanged(values);
        }
    }
}
