import { useCallback, useEffect, useRef, useState } from "react";

/** @internal */
export interface UseControlledOptions<T> {
    componentName: string;
    controlledPropName: string;
    controlledValue: T | undefined;
    defaultValue: T;
    defaultPropName: string;
}

/** @internal */
export const useControlled = <T>(
    options: UseControlledOptions<T>
): [T, (newValue: T) => void] => {
    const {
        componentName,
        controlledPropName,
        controlledValue,
        defaultValue,
        defaultPropName,
    } = options;

    const shouldBeControlled = controlledValue !== void(0);
    const { current: isControlled } = useRef(shouldBeControlled);
    const [value, setValue] = useState(defaultValue);
    const { current: initialValue } = useRef(defaultValue);
    const setValueIfUncontrolled = useCallback(newValue => {
        if (!isControlled) {
            setValue(newValue);
        }
    }, []);

    useEffect(() => {
        if (isControlled !== shouldBeControlled) {
            console.error([
                `An attempt was made to switch whether the '${controlledPropName}' property of `,
                `component '${componentName}' is controlled or not. You must decide whether the `,
                "component shall be controlled or not before the first render of the component.",
            ].join("\n"));
        }
    }, [shouldBeControlled]);

    useEffect(() => {
        if (!isControlled && defaultValue !== initialValue) {
            console.log([
                `An attempt was made to change value of the '${defaultPropName}' property of `,
                `component ${componentName} after being initialized. To make the component controlled `,
                `you should instead use the '${controlledPropName} property.`,
            ].join("\n"));
        }
    }, [defaultValue]);
    
    return [value, setValueIfUncontrolled];
};
