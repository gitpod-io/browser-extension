declare module 'select-dom' {
    export = select;

    function select(selector: string, parent?: Element): Element;
    namespace select {
        const exists: (selector: string, parent?: Element) => Element | undefined;
        const all: (selector: string, parent?: Element | Element[]) => Element[];
    }
}