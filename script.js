// Function to add a new task to the list
function addItem() {
    const newItemText = document.getElementById("newItem").value;
    if (newItemText.trim() !== "") {
        const taskList = document.getElementById("taskList");
        const listItem = document.createElement("li");
        listItem.innerHTML = `<input type="checkbox" onclick="completeItem(this)"> ${newItemText} <button onclick="removeItem(this)">Remove</button>`;
        taskList.appendChild(listItem);
        document.getElementById("newItem").value = ""; // Clear the input field
    }
}

// Function to mark a task as complete
function completeItem(checkbox) {
    const listItem = checkbox.parentElement;
    if (checkbox.checked) {
        listItem.style.textDecoration = "line-through";
    } else {
        listItem.style.textDecoration = "none";
    }
}

// Function to remove a task from the list
function removeItem(button) {
    const listItem = button.parentElement;
    const taskList = document.getElementById("taskList");
    taskList.removeChild(listItem);
}