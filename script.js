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
    }
    catch (err) {
        console.log(err)
    }
    render()
}

const onChangeCheckbox = async (index) => {
    try {
        const resp = await fetch('http://localhost:8000/updateTask', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                id: allTasks[index].id,
                text:allTasks[index].text ,
                isCheck: !allTasks[index].isCheck
            })
        })
        let result = await resp.json();
        allTasks = result.data
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    }
    catch (err) {
        console.log(err)
    }
    render()

}

const onClickButton = async () => {
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
        let result = await resp.json();
        allTasks = result.data
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    }
    catch (err) {
        console.log(err)
    }
    valueInput = ''
    input.value = ''
    render();
}

const updateValue = (event) => {
    valueInput = event.target.value;
}

const deleteTaskHandler = async (id, index) => {
    try {
        const resp = await fetch(`http://localhost:8000/deleteTask?id=${id}`, {
            method: 'DELETE',
        })
        let result = await resp.json();
        allTasks = result.data
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    }
    catch (err) {
        console.log(err)
    }
    render()
}

const editTaskHandler = (index, text, imageEdit) => {
    const inputForEditTask = document.createElement("input")
    inputForEditTask.value = text.textContent
    inputForEditTask.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEditTaskHandler(index, inputForEditTask.value)
        }
    });
    text.replaceWith(inputForEditTask)

    const imageEditOk = document.createElement('img')
    imageEditOk.src = 'sources/check.svg'
    imageEditOk.width = 26;
    imageEditOk.height = 26;
    imageEditOk.style.marginLeft = '8px';

    imageEditOk.addEventListener('click', (e) => {
        saveEditTaskHandler(index, inputForEditTask.value)
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    })
    imageEdit.replaceWith(imageEditOk)
}

const saveEditTaskHandler = async (index, newValue) => {
    try {
        const resp = await fetch('http://localhost:8000/updateTask', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                id: allTasks[index].id,
                text: newValue,
                isCheck: allTasks[index].isCheck
            })
        })
        let result = await resp.json();
        allTasks = result.data
        localStorage.setItem('tasks', JSON.stringify(allTasks))
    }
    catch (err) {
        console.log(err)
    }
    render()
}


render = () => {
    const content = document.getElementById('content-page')
    while (content.firstChild) {
        content.removeChild(content.firstChild)
    }

    allTasks.map((item, index) => {

        const container = document.createElement('div');
        container.id = `task-${index}`
        container.className = 'task-container'

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = item.isCheck
        checkbox.onchange = function () {
            onChangeCheckbox(index)
            localStorage.setItem('tasks', JSON.stringify(allTasks))
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
            deleteTaskHandler(item.id, index)
            localStorage.setItem('tasks', JSON.stringify(allTasks))
        }

        imageEdit.onclick = () => {
            editTaskHandler(index, text, imageEdit)
            localStorage.setItem('tasks', JSON.stringify(allTasks))
        }


        content.appendChild(container)
    })
}

