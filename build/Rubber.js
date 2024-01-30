
(()=>{

    const EzHtml = (existingElement) => { 

        if (typeof existingElement == 'string') { 
            existingElement = document.createElement(main)
        }
        if(existingElement == undefined) { 
            existingElement = document.createElement("div")
        }

        let replacementIdCounter = 1
        let replacementMap = []

        const _parseToString = (obj, isOpeningTag, isClosingTag, isBoth) => {
            if (obj instanceof Node) {
                const replacementId = replacementIdCounter++
                replacementMap.push({
                    node: obj,
                    id: replacementId
                })
                if(isOpeningTag) return `div replaceId='${replacementId}'` 
                if(isClosingTag) return `div`
                if(isBoth) return `div replaceId='${replacementId}'` 

                return `<div replaceId='${replacementId}'></div>`
            }
            if (Array.isArray(obj)) {
                let ret = ""
                for (const subobj of obj) {
                    ret += _parseToString(subobj)
                }
                return ret
            }

            if (typeof obj == 'string') {
                return `${obj}`
            }
        }

          
        return (strings, ...params) => { 
            
            let output = ""
            for (const [i, str] of strings.entries()) {
                output += str
                if (params[i] != undefined) {
                    const before = str?.trim();
                    const after = strings[i+1]?.trim();
                    const isOpeningTag = before.slice(-1) == '<' && after.slice(0,1) == ">"
                    const isClosingTag = before.slice(-2) == '</' && after.slice(0,1) == ">"
                    const isBoth = before.slice(-1) == '<' && after.slice(0,2) == "/>"

                    console.log("call", params[i], isOpeningTag, "B", isClosingTag, isBoth)
                    const appendThis = _parseToString(params[i], isOpeningTag, isClosingTag, isBoth)
                    console.log("APPEND THIS", appendThis) 
                    output += appendThis 
                }
            }




            const temp_container = document.createElement("div")
            temp_container.innerHTML = output 

            function _elementSwap(oldElement, newElement) { 
                const parent = oldElement.parentNode 
                parent.replaceChild(newElement, oldElement)
                for(const oldElementChild of oldElement.childNodes) { 
                    newElement.appendChild(oldElementChild)
                }
            }

            const childElements = Array.from(temp_container.getElementsByTagName("*"));
            console.log("starting with", temp_container)
            debugger 
            for (const _node of childElements) {
                if ((_node instanceof Element) == false) continue;
                const replacement_id = _node.getAttribute("replaceId")
                if (replacement_id == undefined) continue;

                const replNode = 
                    replacementMap.find( mapped => mapped.id == replacement_id)?.node 
                if(replNode != undefined) { 
                    _elementSwap(_node, replNode)
                }
            }

            return temp_container.children[0] 

        } 
    }

    const innerEle1 = document.createElement("div")
    innerEle1.style.backgroundColor = 'red' 
    innerEle1.innerText = "RED"

    const innerEle2 = document.createElement("div")
    innerEle2.style.backgroundColor = 'red' 
    innerEle2.innerText = "RED"

    const outerEle1 = document.createElement("div")
    innerEle1.style.backgroundColor = 'purple' 

    const retElement = EzHtml()`
        <div>
            ${innerEle1}
            <${outerEle1}>
                <${innerEle2}>
                There should be some cool text in here.
            </${outerEle1}>
            <input bind=${bind()}/>
            //bind() above just outputs a replaceid or something 
            similar and then script goies through all elements and if 
            key='bind' the value will = '2-0389rhkjsanfd' or some 
            unique id so swapping can take place 

            <div onClick=${render}/>
            //render function takes THIS element parent, rerenders self and appends itself to parent?
            //might involve saving reference to THIS node so we dont repplace other things in parent 
        </div>
    `
    console.log(retElement) 
    document.body.appendChild(retElement); 

    
    return 



    let main = document.createElement("div")
    main.innerText = "This is some text"
    main.classList.add("main1")
    let sub = document.createElement("div")
    sub.classList.add("sub")

    main.appendChild(sub) 

    console.log("MAIN 1", main) 

    //the process below 

    let temp_container = document.createElement("div")
    temp_container.classList.add("container")

    temp_container.appendChild(main) 


    let main2 = document.createElement("div")
    main2.classList.add("main2")

    for(const child of Array.from(main.childNodes)) { 
        main2.appendChild(child)
    }
    temp_container.replaceChild(main2, main)

    temp_container.removeChild(main2)
    console.log("MAIN 2", main2) 

    return 

    const EasyHTML = (main, props = {}) => {

        if (typeof main == 'string') { 
            main = document.createElement(main)
        }
        let makingElementFromContents = false; 
        if(main == undefined) { 
            main = document.createElement("div")
            makingElementFromContents = true; 
        }
            
        

        return (strings, ...params) => {

            let replacementIdCounter = 1
            const replacementMap = []
            const _parseToString = (obj) => {
                if (obj instanceof Node) {
                    const replacementId = replacementIdCounter++
                    replacementMap.push({
                        node: obj,
                        id: replacementId
                    })
                    return `<div replaceId='${replacementId}'></div>`
                }
                if (Array.isArray(obj)) {
                    let ret = ""
                    for (const subobj of obj) {
                        ret += _parseToString(subobj)
                    }
                    return ret
                }

                if (typeof obj == 'string') {
                    return `${obj}`
                }
            }


            let output = ""
            for (const [i, str] of strings.entries()) {
                output += str
                if (params[i] != undefined) {
                    const before = str;
                    const after = strings[i+1];
                    output += _parseToString(params[i], before, after)
                }
            }

            main.innerHTML = output
            replacementMap.forEach(mapping => {
                let toBeReplaced = undefined;
                const childElements = Array.from(main.getElementsByTagName("*"));
                for (const _node of childElements) {
                    if ((_node instanceof Element) == false) continue;

                    const replacement_id = _node.getAttribute("replaceId")
                    if (replacement_id == undefined) continue;
                    if (replacement_id != mapping.id) continue;

                    toBeReplaced = _node
                }
                if (toBeReplaced == undefined) return;
                toBeReplaced.parentNode.replaceChild(mapping.node, toBeReplaced)
            })

            //TODO REMOVE REMAINIGN REPLACEMENT DIVS (or error handle them) as they'll effect outer calls 

            main.classes = (str) => {
                main.setAttribute("class", str.trim())
                return main 
            }

            main.attr = (key, value) => {
                main.setAttribute(key, value)
                return main
            }

            main.styles = (str) => {
                main.setAttribute("style", str.trim())
                return main
            }

            main.onClick = (listener) => {
                main.addEventListener("click", listener)
                return main
            }

            main.onKeyboard = (listener) => {
                main.addEventListener("keyup", listener)
                return main
            }

            if (makingElementFromContents == true) { 
                console.log("?", main.children.length)
                if(main.children.length > 1) { 
                    throw new Error("Cannot create new element with more than one child node in root")
                }
                main = main.children[0]
            } 
            
            return main 
            

        }
    }

    const ele1 = EasyHTML()`
        <div class='div1'>

        </div>
    `

    const ele2 = EasyHTML()`
        <div class='div2'>

        </div>
    `
    

    const main_element = EasyHTML()`
        <div class='reallycool'>
            This is a super cool 
            <${ele1}>
                Hello
                ${ele2}
            </${ele1}>
            This is here for more testing 
        </div>
    `

    console.log("OUTPUT: ",main_element) 

    })()
    