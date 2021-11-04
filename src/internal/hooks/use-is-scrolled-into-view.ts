import { useEffect, useState } from "react";
import { useScrollBoundary } from "./use-scroll-boundary";

export function useIsScrolledIntoView(element: HTMLElement | null): boolean {
    const [result, setResult] = useState(false);
    const root = useScrollBoundary(element);
    useEffect(() => {
        if (element) {
            const callback = (entries: IntersectionObserverEntry[]) => {
                setResult(entries.some(entry => entry.isIntersecting));
            };
            const observer = new IntersectionObserver(callback, { root });
            observer.observe(element);
            callback(observer.takeRecords());
            return () => observer.disconnect();
        } else {
            setResult(false);
        }
    }, [element, root]);
    return result;
}
