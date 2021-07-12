let allTasks = JSON.parse(localStorage.getItem('tasks')) || []
let valueInput = ''
let input = null

window.onload = async function init() {
    input = document.getElementById('add-task')
    input.addEventListener('change', updateValue)
    try {
        const resp = await fetch('http://localhost:8000/allTasks', {
            method: 'GET'
        })
        let result = await resp.json()
        allTasks = result.data
        localStorage.setItem('tasks', JSON.stringify(allTasks))
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
                isCheck: false
            })
        })
        let result = await resp.json()
        allTasks.push(result)
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    } catch (err) {
        console.log(err)
    }
    valueInput = ''
    input.value = ''
    render();
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
        const resp = await fetch(`http://localhost:8000/deleteTask?id=` + id, {
            method: 'DELETE'
        })
        allTasks.splice(index, 1)
    } catch (err) {
        console.log(err)
    }

    render()
}

//сохранить изменения таска
const saveEditTaskHandler = async ({_id, isCheck, text}, newValue) => {
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
        if (response.ok) {
            allTasks.map(item => item._id === _id && (item.text = newValue))
        }
    } catch (err) {
        console.log(err)
    }
    render()
}


//открытие инпута для изменения таска и создание кнопки сохранения
const editTaskHandler = (index, text, imageEdit, item) => {
    const inputForEditTask = document.createElement("input")
    inputForEditTask.value = text.textContent
    inputForEditTask.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEditTaskHandler(item, inputForEditTask.value)
        }
    });
    text.replaceWith(inputForEditTask)

    const imageEditOk = document.createElement('img')
    imageEditOk.src = 'sources/check.svg'
    imageEditOk.width = 26;
    imageEditOk.height = 26;
    imageEditOk.style.marginLeft = '8px';

    imageEditOk.addEventListener('click', (e) => {
        saveEditTaskHandler(item, inputForEditTask.value)
    })
    imageEdit.replaceWith(imageEditOk)
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

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = item.isCheck
        checkbox.onchange = function () {
            onChangeCheckbox(item)
        }
        container.appendChild((checkbox))

        const text = document.createElement('p')
        text.innerText = item.text
        text.className = item.isCheck ? 'text-task done-text' : 'text-task'
        container.appendChild(text)

        const imageEdit = document.createElement('img')
        imageEdit.src = 'sources/edit.svg'
        imageEdit.width = 26;
        imageEdit.height = 26;
        imageEdit.style.marginLeft = '8px';
        container.appendChild(imageEdit)

        const imageDelete = document.createElement('img')
        imageDelete.src = 'sources/close.svg'
        imageDelete.width = 26;
        imageDelete.height = 26;
        imageDelete.style.marginLeft = '8px';
        container.appendChild(imageDelete)

        imageDelete.onclick = () => {
            deleteTaskHandler(item._id, index)
        }

        imageEdit.onclick = () => {
            editTaskHandler(index, text, imageEdit, item)
        }


        content.appendChild(container)
    })
}

