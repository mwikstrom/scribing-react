import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatIndentDecrease } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const DecrementListLevelButton: FC<ToolbarProps> = ({commands}) => {
    const current = commands.getListLevel();
    return (
        <ToolButton
            disabled={typeof current === "number" && current <= 0}
            onClick={commands.decrementListLevel.bind(commands)}
            children={<Icon path={mdiFormatIndentDecrease}/>}
        />
    );
};
