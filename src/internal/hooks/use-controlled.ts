import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/** @internal */
export interface UseControllableOptions<T> {
    componentName: string;
    controlledPropName: string;
    controlledValue: T | undefined;
    defaultValue: T;
    defaultPropName: string;
}

/** @internal */
export const useControllable = <T>(
    options: UseControllableOptions<T>
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
                `Property '${controlledPropName}' of component '${componentName}'`,
                "cannot change to or from 'undefined' after initialization."
            ].join(" "));
        }
    }, [shouldBeControlled]);

    useEffect(() => {
        if (!isControlled && defaultValue !== initialValue) {
            console.error([
                `Property '${defaultPropName}' of component '${componentName}'`,
                "cannot change after initialization."
            ].join(" "));
        }
    }, [defaultValue]);

    useLayoutEffect(() => {
        if (isControlled && controlledValue !== void(0)) {
            setValue(controlledValue);
        }
    }, [isControlled, controlledValue]);
    
    return [value, setValueIfUncontrolled];
};
