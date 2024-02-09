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
                mainApp = document.getElementById(app)
                if (mainApp === null) {
                    throw new Error('Could not find app element')
                }
                mainApp.style.display = mainApp.style.display === 'none' ? 'flex' : 'none'
                break

            case 'F2':
                alert('penex ui framework is loaded - Hello from penguinify')
                break
        }
    })
    
    if (components === undefined) return

    for (let i = 0; i < components.pens.length; i++) {
        if (components.pens[i].parent === elementGlobals.mainApp) mainApp.appendChild(components.pens[i].element)
    }

    components.scripts.forEach((script) => {
        script()
    })

}

export { setup }

console.info('%cpenex ui framework is loaded', 'color: cornflowerblue; font-size: 20px; font-family: monospace;')
