import { Label } from "office-ui-fabric-react/lib/components/Label";
import { ITag, TagPicker } from "office-ui-fabric-react/lib/components/pickers";
import * as React from "react";

interface ICompletionDropdownProps {
    selected?: ITag[];
    width?: string | number;
    readOnly?: boolean;
    placeholder?: string;
    noResultsFoundText?: string;
    loadingText?: string;
    searchingText?: string;
    onSelectionChanged?: (selection: ITag[]) => void;
    forceValue?: boolean;
    resolveSuggestions: (filter: string, selected?: ITag[]) => ITag[] | PromiseLike<ITag[]>;
    inputWidth?: string | number;
    label?: string;
    onDismiss?: () => void;
}

export class CompletionDropdown extends React.Component<ICompletionDropdownProps, {}> {
    private static counter: number = 0;
    private readonly key: number;
    constructor(props: ICompletionDropdownProps) {
        super(props);
        this.key = CompletionDropdown.counter++;
        this.state = {selected: props.selected};
    }
    public render() {
        return <div
            className={`completion-dropdown k_${this.key}`}
            style={{
                width: this.props.width || 250,
                height: 48,
            }}
        >
            {this.props.label ?
                <Label>{this.props.label}</Label> :
                null
            }
            <TagPicker
                onResolveSuggestions={this.props.resolveSuggestions}
                pickerSuggestionsProps={{
                    searchingText: this.props.searchingText || "Searching...",
                    loadingText: this.props.loadingText || "Loading...",
                    noResultsFoundText: this.props.noResultsFoundText || "No results found",
                }}
                className="completion-dropdown-selector"
                onChange={(items) => {
                    if (this.props.onSelectionChanged) {
                        this.props.onSelectionChanged(items || []);
                        const input = $(`.completion-dropdown.k_${this.key} input`);
                        setTimeout(() => {
                            input.blur();
                            setTimeout(() => input.focus(), 1);
                        }, 1);
                    }
                }}
                onEmptyInputFocus={(selected) => this.props.resolveSuggestions("", selected)}
                onGetMoreResults={(filter, selected) => this.props.resolveSuggestions(filter, selected)}
                defaultSelectedItems={this.props.selected}
                onBlur={console.log.bind(console, "blur")}
                onFocus={console.log.bind(console, "focus")}
                inputProps={{
                    placeholder: this.props.placeholder,
                    readOnly: this.props.readOnly,
                    width: this.props.inputWidth || 200,
                }}
                onDismiss={this.props.onDismiss}
            />
        </div>;
    }
}
