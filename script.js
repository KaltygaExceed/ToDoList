let allTasks = JSON.parse(localStorage.getItem('tasks')) || []
let valueInput = ''
let input = null
// let colorPick = document.getElementsByName('colorPicker')
const colorArray = ['#5e59b4', '#fa9a01', '#1a7602', '#f92c03', '#2fd160', '#4b33ff']

let currentColor

function randomColor() {
    const randIndex = Math.floor(Math.random() * colorArray.length)
    return colorArray[randIndex]
}

function onSelectColor(event) {
    currentColor = event.target
    const colors = document.querySelector('#colorPicker')
    for (let i = 0; i < colors.children.length; i++) {
      const isInputChecked =  colors.children[i].children[1].checked
        const realButton = colors.children[i].children[0]
        if (isInputChecked) {
            realButton.classList.add("active-color")
        } else if (realButton.classList.contains('active-color')) {
                realButton.classList.remove('active-color')
        }
    }
}



// снятие value с колорпикера
window.onload = async function init() {
    const colors = document.querySelector('#colorPicker')
    colorArray.map((item, index) => {
        const labelButton = document.createElement('label')
        const realButton = document.createElement('div')
        realButton.className = 'colorButtons'
        realButton.style.background = item
        const radButton = document.createElement('input');
        radButton.style.display = "none"
        radButton.name = `colorPicker`
        radButton.type = 'radio'
        radButton.value = `${colorArray[index]}`
        radButton.onchange = onSelectColor
        colors.append(labelButton)
        labelButton.append(realButton)
        labelButton.append(radButton)
    })





    // Рендер всех тасков
    input = document.getElementById('add-task')
    input.addEventListener('change', updateValue)
    try {
        const resp = await fetch('http://localhost:8000/allTasks', {
            method: 'GET'
        })
        let result = await resp.json()
        allTasks = result.data
    } catch (err) {
        console.log(err)
    }
    render()
}

//Создание таска
const onCreateTask = async () => {
    if (valueInput === "") {
        return
    }
    try {
        const resp = await fetch('http://localhost:8000/createTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                text: valueInput,
                isCheck: false,
                color: currentColor ? currentColor.value : randomColor()
            })
        })
        let result = await resp.json()
        allTasks.push(result)
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    } catch (err) {
        console.log(err)
    }
    console.log()
    valueInput = ''
    input.value = ''
    if (currentColor) {
        currentColor.checked = false
    }
    const colors = document.querySelector('#colorPicker')
    for (let i = 0; i < colors.children.length; i++) {
        const realButton = colors.children[i].children[0]
        if (realButton.classList.contains('active-color')) {
            realButton.classList.remove('active-color')
        }
    }
    currentColor = null
    render()
}

//зачеркнуть текст по чекбоксу
const onChangeCheckbox = async ({_id, isCheck, text}) => {
    try {
        const response = await fetch('http://localhost:8000/updateTask', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                _id,
                text,
                isCheck: !isCheck
            })
        })
        if (response.ok) {
            allTasks.map(item => item._id === _id && (item.isCheck = !item.isCheck))
        }
    } catch (err) {
        console.log(err)
    }
    render()
}


const updateValue = (event) => {
    valueInput = event.target.value;
}

// Удалить таск
const deleteTaskHandler = async (id, index) => {
    try {
        const response = await fetch(`http://localhost:8000/deleteTask?id=` + id, {
            method: 'DELETE'
        })
        if (response.ok) {
            allTasks.splice(index, 1)
        }
    } catch (err) {
        console.log(err)
    }

    render()
}

//сохранить изменения таска
const saveEditTaskHandler = async ({_id, isCheck, text}, newValue) => {
    if (newValue === '') {
        return
    }
    try {
        const response = await fetch('http://localhost:8000/updateTask', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                _id,
                text: newValue,
                isCheck,
            })
        })
        if
        (response.ok) {
            allTasks.map(item => item._id === _id && (item.text = newValue))
        }
    } catch (err) {
        console.log(err)
    }
    render()
}


//открытие инпута для изменения таска и создание кнопки сохранения
const editTaskHandler = (index, text, item) => {
    const inputForEditTask = document.createElement("textarea")
    inputForEditTask.value = text.textContent
    inputForEditTask.className = 'editInput'
    inputForEditTask.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEditTaskHandler(item, inputForEditTask.value)
        }
    })
    text.replaceWith(inputForEditTask)

}

// функция рендера
render = () => {
    const content = document.getElementById('content-page')
    while (content.firstChild) {
        content.removeChild(content.firstChild)
    }

    //мап всех тасков
    allTasks.map((item, index) => {

        const container = document.createElement('div');
        container.id = `task-${index}`
        container.className = 'task-container'
        container.style.background = item.isCheck ? '#c6c4c6' : item.color

        const checkboxContainer = document.createElement('div')
        checkboxContainer.className = 'containerWithCheck'
        container.appendChild(checkboxContainer)

        const textContainer = document.createElement('div')
        textContainer.className = 'containerWithText'
        container.appendChild(textContainer)

        const controlContainer = document.createElement('div')
        controlContainer.className = 'containerWithControl'
        container.appendChild(controlContainer)

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'checkbox'
        checkbox.checked = item.isCheck
        checkbox.onchange = function () {
            onChangeCheckbox(item)
        }
        checkboxContainer.appendChild((checkbox))

        const text = document.createElement('p')
        text.innerText = item.text
        text.className = item.isCheck ? 'text-task done-text' : 'text-task'
        textContainer.appendChild(text)


        const imageDelete = document.createElement('img')
        imageDelete.src = 'sources/close.svg'
        imageDelete.width = 26;
        imageDelete.height = 26;
        controlContainer.appendChild(imageDelete)

        imageDelete.onclick = () => {
            deleteTaskHandler(item._id, index)
        }

        text.ondblclick = () => {
            editTaskHandler(index, text, item)
        }
        content.append(container)
    })



}





