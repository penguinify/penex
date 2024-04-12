# part 1
### first file
The best way to learn penex is to look at its source code. Here is the smallest file in the framework (penex.ts)
```typescript
import { Components, elementGlobals } from './penexutils'

// Default layout
const defaultLayout = `
        <div id="main-app" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw;">
            <h1>Welcome to penex ui framework</h1>
            <h2>@penguinify</h2>
        </div>
    `

function setup(app: string, layout: string = defaultLayout, components?: Components) {
    // stfu idc
    document.body.innerHTML = layout + document.body.innerHTML

    let mainApp = document.getElementById(app)

    if (mainApp === null) {
        throw new Error('Could not find app element')
    }

    // debug hide
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case '\\':
                if (mainApp === null) return
                mainApp.style.display = mainApp.style.display === 'none' ? 'flex' : 'none'
                break
            case 'F2':
                alert('penex ui framework is loaded')
                break
        }
    })

    if (components === undefined) return
    for (let i = 0; i < components.pens.length; i++) {
        try {
            if (components.pens[i].parent === elementGlobals.mainApp) mainApp.appendChild(components.pens[i].element)
        } catch (e) {
            throw 'Error: ' + e + ' at component ' + components.pens[i]
        }
    }

    components.scripts.forEach((script) => {
        try {
            script()
        } catch (e) {
            throw 'Error: ' + e + ' at script ' + script
        }
    })
}

export { setup }
```

Lets disect. Default layout is whatever and nothing gets interesting until we get to these lines.
```typescript
    if (components === undefined) return
    for (let i = 0; i < components.pens.length; i++) {
        try {
            if (components.pens[i].parent === elementGlobals.mainApp) mainApp.appendChild(components.pens[i].element)
        } catch (e) {
            throw 'Error: ' + e + ' at component ' + components.pens[i]
        }
    }

    components.scripts.forEach((script) => {
        try {
            script()
        } catch (e) {
            throw 'Error: ' + e + ' at script ' + script
        }
    })

```
It gets the components and scripts from the components object and runs them. The components are appended to the main app element and the scripts are run. Thats it. Thats the whole setup part of the framework.

### second file
```typescript

type HTMLMarkup = string

interface Component {
    pens?: Pen<Elements>[]
    // tf are these names ;-;
    penIt?(): Pen<Elements>[]
    stringIt?(): string
}

class Components {
    pens: Pen<Elements>[] = []
    scripts: (() => void)[] = []

    constructor() {}

    addComponents(component: Component[]): void {
        for (let i = 0; i < component.length; i++) {
            this.addComponent(component[i])
        }
    }

    addScript(script: () => void): void {
        this.scripts.push(script)
    }

    addComponent(component: Component): void {
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
}

enum elementGlobals {
    mainApp = 'main-app',
}

type Elements = HTMLElement | HTMLInputElement | HTMLTextAreaElement | HTMLIFrameElement

class Pen<T extends Elements> {
    element: T
    parent?: HTMLElement | elementGlobals

    constructor(tag: string, parent?: T | elementGlobals) {
        this.element = document.createElement(tag) as T

        if (parent) this.setParent(parent)
    }

    setParent(parent: HTMLElement | elementGlobals) {
        if (parent instanceof HTMLElement) {
            this.parent = parent
            this.parent.appendChild(this.element)
        } else if (parent === elementGlobals.mainApp) this.parent = elementGlobals.mainApp
    }

    static fromElement<E extends Elements>(element: E, parent?: E | elementGlobals): Pen<E> {
        let pen: Pen<E> = new Pen(element.tagName)
        pen.element = element
        if (parent) pen.setParent(parent)
        else if (element.parentElement) pen.setParent(element.parentElement!)

        return pen
    }

    static fromHTML(html: HTMLMarkup): Pen<Elements>[] {
        const element = document.createElement('div')
        element.innerHTML = html

        const pens: Pen<HTMLElement>[] = []

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

function getPenFromElementId(id: string, pens: Pen<Elements>[]): Pen<Elements> {
    let pen = pens.filter((p) => p.element.id === id)[0]
    if (pen) return pen
    else throw new Error(`No pen with id ${id} found.`)
}

export { getPenFromElementId, Component, Components, Pen, elementGlobals, Elements }
```

i gave up writing this lmao
