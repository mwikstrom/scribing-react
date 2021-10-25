import Icon from "@mdi/react";
import React, { FC } from "react";
import { ToolButton } from "./ToolButton";
import { mdiFormatIndentIncrease } from "@mdi/js";
import { ToolbarProps } from "./Toolbar";

export const IncrementListLevelButton: FC<ToolbarProps> = ({commands, editingHost}) => {
    const current = commands.getListLevel();
    return (
        <ToolButton
            editingHost={editingHost}
            disabled={typeof current === "number" && current >= 9}
            onClick={commands.incrementListLevel.bind(commands)}
            children={<Icon path={mdiFormatIndentIncrease}/>}
        />
    );
};
