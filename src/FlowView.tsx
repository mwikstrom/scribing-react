import React, { FC } from "react";
import { createUseStyles } from "react-jss";
import { FlowContent, FlowSelection, FlowTheme } from "scribing";
import { AssetLoaderScope } from "./internal/AssetLoaderScope";
import { FlowFragmentView } from "./internal/FlowFragmentView";
import { FlowThemeScope } from "./internal/FlowThemeScope";
import { LinkResolverScope } from "./internal/LinkResolverScope";
import { makeJssId } from "./internal/utils/make-jss-id";
import { LoadAssetEvent } from "./LoadAssetEvent";
import { ResolveLinkEvent } from "./ResolveLinkEvent";

/**
 * Component props for {@link FlowView}
 * @public
 */
export interface FlowViewProps {
    content: FlowContent;   
    theme?: FlowTheme;
    selection?: FlowSelection | null;    
    onLoadAsset?: (event: LoadAssetEvent) => void;
    onResolveLink?: (event: ResolveLinkEvent) => void;
}

/**
 * Flow content view component
 * @public
 */
export const FlowView: FC<FlowViewProps> = props => {
    const { content: { nodes }, theme, selection, onLoadAsset, onResolveLink } = props;
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <LinkResolverScope handler={onResolveLink}>
                <AssetLoaderScope handler={onLoadAsset}>
                    <FlowThemeScope theme={theme}>
                        <FlowFragmentView nodes={nodes} selection={selection ?? false}/>
                    </FlowThemeScope>
                </AssetLoaderScope>
            </LinkResolverScope>
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
