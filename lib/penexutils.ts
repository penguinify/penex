import { setup } from './penex'

type HTMLMarkup = string

export interface Component {
    pens: PenArray;
    render(): PenArray;
}

class Components {
    pens: PenArray = new PenArray();

    constructor() { }

    add(...components: Component[]): void {
        components.forEach((component) => {
            this.pens.push(...component.render());
        });
    }


}

export enum elementGlobals {
    // The main application container, usually a div with id 'app' defined in the layout
    // useful for components to attach themselves to the main app container instead of just the route or etc.
    mainApp = 'app',
}

export type Elements = HTMLElementTagNameMap[keyof HTMLElementTagNameMap]

class Pen<T extends Elements> {
    element: T
    parent?: Elements | elementGlobals

    constructor(tag: string, parent?: T | elementGlobals) {
        this.element = document.createElement(tag) as T

        if (parent) this.setParent(parent)
    }

    setParent(parent: HTMLElement | elementGlobals | Pen<Elements>): void {
        if (parent instanceof HTMLElement) {
            this.parent = parent
            this.parent.appendChild(this.element)
        } else if (parent === elementGlobals.mainApp) {
            this.parent = elementGlobals.mainApp
        } else if (parent instanceof Pen) {
            this.parent = parent.element
            this.parent.appendChild(this.element)
        }
    }

    asPenArray(): PenArray {
        return new PenArray(this)
    }


    static fromElement<E extends Elements>(element: E, parent?: E | elementGlobals): Pen<E> {
        let pen: Pen<E> = new Pen(element.tagName)
        pen.element = element

        if (parent) pen.setParent(parent)
        else if (element.parentElement) pen.setParent(element.parentElement!)

        return pen
    }

    static fromHTML(html: HTMLMarkup): PenArray {
        const element = document.createElement('div')
        element.innerHTML = html

        const pens: PenArray = new PenArray()

        // double it up to get both direct children and nested children
        Array.from(element.children).forEach((child) => {
            const pen = Pen.fromElement(child as HTMLElement, elementGlobals.mainApp)
            pens.push(pen)
        })

        element.querySelectorAll('*').forEach((child) => {
            const pen = Pen.fromElement(child as HTMLElement)
            pens.push(pen)
        })


        return pens
    }


}

export class PenArray extends Array<Pen<Elements>> {


    constructor(...pens: Pen<Elements>[]) {
        super(...pens)
    }

    getById(id: string): Pen<Elements> {
        return this.find((pen) => pen.element.id === id)!;
    }

    querySelectorAll(selector: string): PenArray {
        const pens: PenArray = new PenArray()

        this.forEach((pen) => {
            if (pen.element.matches(selector)) {
                pens.push(pen)
            }
            pen.element.querySelectorAll(selector).forEach((child) => {
                const childPen = Pen.fromElement(child as HTMLElement)
                pens.push(childPen)
            })
        })
        return pens
    }

    querySelector(selector: string): Pen<Elements> | null {
        for (let pen of this) {
            if (pen.element.matches(selector)) {
                return pen
            }
            const child = pen.element.querySelector(selector)
            if (child) {
                return Pen.fromElement(child as HTMLElement)
            }
        }
        return null
    }



}

export abstract class Route {
    layout(layout: string): string | undefined {
        return layout
    }
    path: string = '/'

    pens: PenArray = new PenArray()
    components: Components = new Components()
    render(): PenArray {
        return new PenArray();
    }
    onRoute?(): void

}

// Useful for routes that require asynchronous data fetching before rendering
export abstract class AsyncRoute extends Route {
    async renderAsync(): Promise<PenArray> {
        return new PenArray();
    }

    // Functio to give pensAsync a default value as a loading state or as a default value.
    renderFallback(): PenArray {
        return new PenArray();
    }


    pensAsync: Promise<PenArray> = Promise.resolve(new PenArray());

}

export class Router {
    routes: Route[] = []
    path: string
    defaultLayout: HTMLMarkup

    constructor(defaultLayout: HTMLMarkup, initialPath: string = '/', routes?: Route[]) {
        this.defaultLayout = defaultLayout
        this.path = initialPath
        if (routes) this.addRoutes(routes)

        this.navigateTo(this.path)
    }

    addRoute(route: Route): void {
        this.routes.push(route)
    }

    addRoutes(routes: Route[]): void {
        this.routes.push(...routes)
    }

    private appendRouteToMainApp(route: Route): void {
        // reload webpage
        window.document.body.innerHTML = ''


        let layout = route.layout(this.defaultLayout) || this.defaultLayout
        setup(elementGlobals.mainApp, layout, route.components)

        let mainApp = document.getElementById(elementGlobals.mainApp)
        if (mainApp === null) throw new Error('No main app element found.')
        for (let i = 0; i < route.pens.length; i++) {
            try {
                if (route.pens[i].parent === elementGlobals.mainApp) {
                    mainApp.appendChild(route.pens[i].element)
                }
            } catch (e) {
                throw 'Error: ' + e + ' at component ' + route.pens[i]
            }
        }

    }

    async navigateTo(path: string): Promise<void> {
        const route = this.routes.find(r => r.path === path)
        if (!route) throw new Error(`No route with path ${path} found.`)

        this.path = path


        if (route instanceof AsyncRoute) {
            let fallBackPens = route.renderFallback()
            route.pens = fallBackPens
            this.appendRouteToMainApp(route)



            route.pens = await route.pensAsync

        }


        this.appendRouteToMainApp(route)

        route.onRoute?.()

    }


}

export function sanitize(unsafe_string: string): string {
    const map: {
        [key: string]: string
    } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return unsafe_string.replace(/[&<>"']/g, function(m) { return map[m]; });
}

export { Components, Pen }
