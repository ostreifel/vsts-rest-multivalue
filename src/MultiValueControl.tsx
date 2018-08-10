import { Checkbox } from "office-ui-fabric-react/lib/components/Checkbox";
import { ITag, TagPicker } from "office-ui-fabric-react/lib/components/pickers";
import { TextField } from "office-ui-fabric-react/lib/components/TextField";
import { FocusZone, FocusZoneDirection } from "office-ui-fabric-react/lib/FocusZone";
import * as React from "react";
import { DelayedFunction } from "VSS/Utils/Core";

interface IMultiValueControlProps {
    selected?: string[];
    width?: number;
    readOnly?: boolean;
    placeholder?: string;
    noResultsFoundText?: string;
    searchingText?: string;
    onSelectionChanged?: (selection: string[]) => Promise<void>;
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
            const selected = (this.props.selected || []).slice(0);
            const filteredOpts = this._filteredOptions();
            console.log("render", this.props, this.state);
            return <div className="multi-value-control options">
                <TextField value={selected.join(";") + (selected.length > 0 ? ";" : "") + this.state.filter}
                    autoFocus
                    onBlur={this._onBlur}
                    onFocus={this._onFocus}
                    onKeyDown={this._onInputKeyDown}
                    onChange={this._onInputChange}
                />
                <FocusZone
                    direction={FocusZoneDirection.vertical}
                    className="checkboxes"
                >
                    {this.state.filter ? null :
                    <Checkbox
                        label="Select All"
                        checked={selected.join(";") === options.join(";")}
                        className={this.state.idx === 0 ? "hover" : ""}
                        onChange={this._toggleSelectAll}
                        inputProps={{
                            onBlur: this._onBlur,
                            onFocus: this._onFocus,
                        }}
                    />}
                    {filteredOpts
                    .map((o, i) => <Checkbox
                        className={this._getOptionClass(i, filteredOpts)}
                        checked={selected.indexOf(o) >= 0}
                        inputProps={{
                            onBlur: this._onBlur,
                            onFocus: this._onFocus,
                        }}
                        onChange={() => this._toggleOption(o)}
                        label={o}
                    />)}
                </FocusZone>
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
    private _getOptionClass = (i: number, filteredOpts: string[]): string => {
        const {idx, filter} = this.state;
        if (!filter) {
            i++;
        }
        const max = filter ? filteredOpts.length - 1 : filteredOpts.length;

        if (i === idx || (i === max && idx > max)) {
            return "hover";
        }
        return "";
    }
    private _toggleSelectAll = () => {
        const options = this.props.options;
        const selected = this.props.selected || [];
        if (selected.join(";") === options.join(";")) {
            this._setSelected([]);
        } else {
            this._setSelected(options);
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
    private _onInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            if (this.state.idx + 1 < this.props.options.length + (this.state.filter ? 0 : 1)) {
                this.setState({idx: this.state.idx + 1});
            }
            e.preventDefault();
            e.stopPropagation();
            break;
            case 13: // enter
            const opts = this._filteredOptions();
            if (opts.length > 0) {
                let idx = this.state.idx;
                if (!this.state.filter && idx-- === 0) {
                    this._toggleSelectAll();
                } else if (this._toggleOption(opts[Math.min(idx, opts.length - 1)])) {
                    this.setState({filter: ""});
                }
            }
            e.preventDefault();
            e.stopPropagation();
            break;
            case 8: // backspace
            const input = e.target as HTMLInputElement;
            if (typeof input.selectionStart === "number" && input.selectionStart === input.selectionEnd) {
                const {
                    value,
                    selectionStart: pos,
                } = input;
                if (value.charAt(pos - 1) === ";") {
                    e.preventDefault();
                    e.stopPropagation();
                    const before = value.substr(0, pos - 1);
                    const after = value.substr(pos);
                    if (!after) {
                        const items = before.split(";");
                        const filter = items.pop() as string;
                        await this._setSelected(items);
                        this.setState({filter});
                        return;
                    }
                }
            }
            break;
        }
    }
    private _onInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        if (!newValue) {
            this._setSelected([]);
            this.setState({filter: ""});
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
    private _setSelected = async (selected: string[]): Promise<void> => {
        if (!this.props.onSelectionChanged) {
            return;
        }
        await this.props.onSelectionChanged(selected);
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
