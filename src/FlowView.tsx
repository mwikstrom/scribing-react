import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { FlowContent, FlowSelection } from "scribing";
import { AssetLoaderScope } from "./internal/AssetLoaderScope";
import { FlowFragmentView } from "./internal/FlowFragmentView";
import { makeJssId } from "./internal/utils/make-jss-id";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;
    
    selection?: FlowSelection | null;

    /**
     * Invoked when a flow content asset needs to be loaded.
     * @param url - URL of the asset to be loaded
     * @returns A promise that is resolved either with the asset's blob or a string that
     *          is a resolved URL for the asset that shall be used to load the asset in
     *          the standard way (for example by loading it as an opaque image).
     */
    onLoadAsset?: (url: string) => Promise<Blob | string>;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { content: { nodes }, selection, onLoadAsset } = props;
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <AssetLoaderScope loader={onLoadAsset}>
                <FlowFragmentView nodes={nodes} selection={selection ?? false}/>
            </AssetLoaderScope>
        </div>
    );
};

const useStyles = createUseStyles({
    root: {
        counterReset: [...new Array(9)].map((_,i) => `li${i + 1} 0`).join(" "),
    },
}, {
    generateId: makeJssId("FlowView"),
});
