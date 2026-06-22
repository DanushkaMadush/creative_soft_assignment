import { Suspense, type ComponentType } from "react";

export default function LazyLoad(Component: ComponentType) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Component />
        </Suspense>
    );
}