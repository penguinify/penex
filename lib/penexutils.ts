type HTMLMarkup = string

interface Component {
    // tf are these names ;-;
    penIt?(): Pen<Elements>[]
    stringIt?(): string
}

abstract class Component {
    pens: Pen<Elements>[] = []
}

class Components {
    pens: Pen<Elements>[] = []
    scripts: (() => void)[] = []

    constructor() {}

    addComponent(component: Component) {
        let pen: Pen<Elements>[] = []
        if (component.stringIt) {
            pen = Pen.fromHTML(component.stringIt())
        } else if (component.penIt) {
            pen = component.penIt()
        }

        if (Array.isArray(pen)) {
            this.pens.push(...pen)
        } else {
            this.pens.push(pen)
        }
    }

    addScript(script: () => void): void {
        this.scripts.push(script)
    }
}

enum elementGlobals {
    mainApp = 'main-app',
}

type Elements = HTMLElement | HTMLInputElement | HTMLTextAreaElement | HTMLIFrameElement

class Pen<T extends Elements> {
    element: HTMLElement | HTMLInputElement
    parent?: HTMLElement | elementGlobals

    constructor(tag: string, parent?: T | elementGlobals) {
        this.element = document.createElement(tag)

        if (parent) this.setParent(parent)
    }

    setParent(parent: HTMLElement | elementGlobals) {
        if (parent instanceof HTMLElement) {
            this.parent = parent
            this.parent.appendChild(this.element)
        } else if (parent === elementGlobals.mainApp) this.parent = elementGlobals.mainApp
    }

    setType<E extends Elements>() {
        this.element = this.element as E
    }

    static fromElement<E extends Elements>(element: HTMLElement, parent?: E | elementGlobals): Pen<E> {
        let pen = new Pen(element.tagName)
        pen.element = element
        if (parent) pen.setParent(parent)
        else if (element.parentElement) pen.setParent(element.parentElement!)

        return pen
    }

    static fromHTML(html: HTMLMarkup): Pen<HTMLElement>[] {
        let element = document.createElement('div')
        element.innerHTML = html

        let baseChildren = element.children
        let allChildren = element.querySelectorAll('*')
        let pens: Pen<HTMLElement>[] = []

        for (let i = 0; i < baseChildren.length; i++) {
            let pen = Pen.fromElement(baseChildren[i] as HTMLElement, elementGlobals.mainApp)
            pens.push(pen)
        }

        for (let i = 0; i < allChildren.length; i++) {
            let pen = Pen.fromElement(allChildren[i] as HTMLElement)
            pens.push(pen)
        }

        return pens
    }
}

function getPenFromElementId(id: string, pens: Pen<Elements>[]): Pen<Elements> {
    let pen = pens.filter((p) => p.element.id === id)[0]
    if (pen) return pen
    else throw new Error(`No pen with id ${id} found.`)
}

export { getPenFromElementId, Component, Components, Pen, elementGlobals }
