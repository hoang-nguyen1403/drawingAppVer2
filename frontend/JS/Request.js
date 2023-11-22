var methodAttribute = domClass("methodAttribute")[0];
var typeAttributeSelect = domClass("typeAttribute-select")[0];
var typeAttributeText = domClass("typeAttribute-text")[0];
var buttonMethod = domClass("buttonMethod")[0];
var confirmButton = domClass("confirm")[0];
var url = domClass("URL")[0];
var func = domClass("function")[0];
var param = domClass("parameter")[0];
var type_text = domID("typeAttribute");
var type_change = domID("typeChange");
var addAttr = domID("addAttribute");
var editAttr = domID("editAttribute");
var deleteAttr = domID("deleteAttribute");
var title = domID("Title");
var key_url = "url";
var key_Function = "Function";
var key_Parameter = "Parameter";
var arr_url = [];
var arr_Function = [];
var arr_Parameter = [];

function openPopUp() {
    document.getElementById("myForm").style.display = "block";
}
function closePopUp() {
    document.getElementById("myForm").style.display = "none";
    if (addAttr.value === "On") {
        addAttr.value = "Off";
        addAttr.style.backgroundColor = "lightblue";
    } else if (editAttr.value === "On") {
        editAttr.value = "Off";
        editAttr.style.backgroundColor = "lightblue";
    } else if (deleteAttr.value === "On") {
        deleteAttr.value = "Off";
        deleteAttr.style.backgroundColor = "lightblue";
    }
    url.value = "Off";
    func.value = "Off";
    param.value = "Off";
    url.style.backgroundColor = "#ffff";
    func.style.backgroundColor = "#ffff";
    param.style.backgroundColor = "#ffff";
    type_text.innerHTML = "";
    type_change.innerHTML = "";
    typeAttributeText.style.display = "none";
    typeAttributeSelect.style.display = "none";
    buttonMethod.style.top = "120px";
    confirmButton.style.display = "none";
}

function isValidUrl(urlString) {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
}

function addNewURL() {
    if (isValidUrl(typeAttributeText.value)) {
        if (arr_url != null) {
            let find = checkExist(typeAttributeText.value, arr_url);
            if (find) {
                alert("This url existed")
            } else {
                addLocalStorage(arr_url, key_url, typeAttributeText.value);
                alert("New URL has been added");
            }
        } else {
            addLocalStorage(arr_url, key_url, typeAttributeText.value);
            alert("New URL has been added");
        }
    } else {
        alert("Just input URL, please input URL");
    }
}
function addNewFUNC() {
    if (typeAttributeText.value === "" || !typeAttributeText.value) {
        alert("Your input is null, please input Function");
    } else {
        if (arr_Function != null) {
            let find = checkExist(typeAttributeText.value, arr_Function);
            if (find) {
                alert("This Function existed")
            } else {
                addLocalStorage(arr_Function, key_Function, typeAttributeText.value);
                alert("New Function has been added");
            }
        } else {
            addLocalStorage(arr_Function, key_Function, typeAttributeText.value);
            alert("New Function has been added");
        }
    }
}

function addNewParam() {
    if (typeAttributeText.value === "" || !typeAttributeText.value) {
        alert("Your input is null, please input Parameter");
    } else {
        if (arr_Parameter != null) {
            let find = checkExist(typeAttributeText.value, arr_Parameter);
            if (find) {
                alert("This Parameter existed")
            } else {
                addLocalStorage(arr_Parameter, key_Parameter, typeAttributeText.value);
                alert("New Parameter has been added");
            }
        } else {
            addLocalStorage(arr_Parameter, key_Parameter, typeAttributeText.value);
            alert("New Parameter has been added");
        }
    }
}

function addLocalStorage(arr, key, value) {
    if (localStorage.getItem(key)) {
        arr.push(value);
        localStorage.setItem(key, JSON.stringify(arr));
    } else {
        localStorage.setItem(key, value);
    }
}

function showValueLocalStorage() {
    arr_url = [];
    arr_Function = [];
    arr_Parameter = [];
    document.getElementById("urlInputted").innerHTML = "";
    document.getElementById("functionNameInputted").innerHTML = "";
    document.getElementById("parameterSelected").innerHTML = "";
    if (isJson(localStorage.getItem(key_url))) {
        arr_url = JSON.parse(localStorage.getItem(key_url));
    } else arr_url.push(localStorage.getItem(key_url));
    if (isJson(localStorage.getItem(key_Function))) {
        arr_Function = JSON.parse(localStorage.getItem(key_Function));
    } else arr_Function.push(localStorage.getItem(key_Function));
    if (isJson(localStorage.getItem(key_Parameter))) {
        arr_Parameter = JSON.parse(localStorage.getItem(key_Parameter));
    } else arr_Parameter.push(localStorage.getItem(key_Parameter));
    if (arr_url !== null) {
        for (let i = 0; i < arr_url.length; i++) {
            document.getElementById("urlInputted").innerHTML += `
              <option value=${arr_url[i]}>${arr_url[i]}</option>
            `
        }
    }
    if (arr_Function !== null) {
        for (let i = 0; i < arr_Function.length; i++) {
            document.getElementById("functionNameInputted").innerHTML += `
              <option value=${arr_Function[i]}>${arr_Function[i]}</option>
            `
        }
    }
    if (arr_Parameter !== null) {
        for (let i = 0; i < arr_Parameter.length; i++) {
            document.getElementById("parameterSelected").innerHTML += `
              <option value=${arr_Parameter[i]}>${arr_Parameter[i]}</option>
            `
        }
    }
}
showValueLocalStorage()


function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function checkExist(value, type) {
    let find;
    if (typeof type === 'object') {
        find = type.find((Element) => Element == value);
    } else {
        find = type.search(value);
    }
    return find;
}

function settingRequest() {
    if (domID("settingRequest").value === "On") {
        domID("request").style.display = "none";
        domID("settingRequest").value = "Off";
        domID("settingRequest").style.backgroundColor = "#ffff";
        closePopUp();
    } else {
        domID("settingRequest").value = "On";
        domID("request").style.display = "flex";
        domID("tab-icon").value = "Off";
        domClass("tab")[0].style.width = "3%";
        domID("tab-comments").style.display = "none";
        domID("tab-icon").style.width = "100%";
        domID("Show").style.width = "97%";
        domID("tab-icon").style.transform = "rotate(180deg)";
        domID("tab-icon").title = "Open";
        domID("settingRequest").style.backgroundColor = "#57fa6d";
        resize.drawAfterResize();
    }
}

function domClass(id) {
    return document.getElementsByClassName(id)
}

function domID(id) {
    return document.getElementById(id)
}

function methodURL() {
    if (url.value === "Off") {
        url.value = "On";
        url.style.backgroundColor = "#57fa6d";
        func.value = "Off";
        param.value = "Off";
        func.style.backgroundColor = "#ffff";
        param.style.backgroundColor = "#ffff";
        buttonMethod.style.top = "60px";
        if (addAttr.value === "On") {
            type_text.innerHTML = "Add url"
            typeAttributeText.style.display = "block";
            typeAttributeText.value = "";
        } else if (editAttr.value === "On") {
            type_text.innerHTML = "Edit url";
            type_change.innerHTML = "New url";
            typeAttributeText.style.display = "block";
            typeAttributeSelect.style.display = "block";
            buttonMethod.style.top = "0px";
            loadAttribute();
        } else if (deleteAttr.value === "On") {
            type_text.innerHTML = "Delete url"
            typeAttributeSelect.style.display = "block";
            loadAttribute();
        }
        confirmButton.style.display = "block";
    } else {
        url.value = "Off";
        url.style.backgroundColor = "#ffff";
        type_text.innerHTML = "";
        type_change.innerHTML = "";
        typeAttributeText.style.display = "none";
        typeAttributeSelect.style.display = "none";
        buttonMethod.style.top = "120px";
        confirmButton.style.display = "none";
    }
}

function methodFunc() {
    if (func.value === "Off") {
        func.value = "On";
        func.style.backgroundColor = "#57fa6d";
        param.value = "Off";
        url.value = "Off";
        param.style.backgroundColor = "#ffff";
        url.style.backgroundColor = "#ffff";
        type_text.innerHTML = "Add Function";
        buttonMethod.style.top = "60px";
        if (addAttr.value === "On") {
            type_text.innerHTML = "Add Function"
            typeAttributeText.style.display = "block";
            typeAttributeText.value = "";
        } else if (editAttr.value === "On") {
            type_text.innerHTML = "Edit Function";
            type_change.innerHTML = "New Function";
            typeAttributeText.style.display = "block";
            typeAttributeSelect.style.display = "block";
            buttonMethod.style.top = "0px";
            loadAttribute();
        } else if (deleteAttr.value === "On") {
            type_text.innerHTML = "Delete Function"
            typeAttributeSelect.style.display = "block";
            loadAttribute();
        }
        confirmButton.style.display = "block";
    } else {
        func.value = "Off";
        func.style.backgroundColor = "#ffff";
        type_text.innerHTML = "";
        type_change.innerHTML = "";
        typeAttributeText.style.display = "none";
        typeAttributeSelect.style.display = "none";
        buttonMethod.style.top = "120px";
        confirmButton.style.display = "none";
    }
}

function methodParam() {
    if (param.value === "Off") {
        param.value = "On";
        param.style.backgroundColor = "#57fa6d";
        url.value = "Off";
        func.value = "Off";
        url.style.backgroundColor = "#ffff";
        func.style.backgroundColor = "#ffff";
        type_text.innerHTML = "Add Parameter";
        buttonMethod.style.top = "60px";
        if (addAttr.value === "On") {
            type_text.innerHTML = "Add Parameter"
            typeAttributeText.style.display = "block";
            typeAttributeText.value = "";
        } else if (editAttr.value === "On") {
            type_text.innerHTML = "Edit Parameter";
            type_change.innerHTML = "New Parameter";
            typeAttributeText.style.display = "block";
            typeAttributeSelect.style.display = "block";
            buttonMethod.style.top = "0px";
            loadAttribute();
        } else if (deleteAttr.value === "On") {
            type_text.innerHTML = "Delete Parameter"
            typeAttributeSelect.style.display = "block";
            loadAttribute();
        }
        confirmButton.style.display = "block";
    } else {
        param.value = "Off";
        param.style.backgroundColor = "#ffff";
        type_text.innerHTML = "";
        type_change.innerHTML = "";
        typeAttributeText.style.display = "none";
        typeAttributeSelect.style.display = "none";
        buttonMethod.style.top = "120px";
        confirmButton.style.display = "none";
    }
}

function addAttribute() {
    if (addAttr.value === "Off") {
        closePopUp();
        addAttr.value = "On";
        addAttr.style.backgroundColor = "#57fa6d";
        editAttr.value = "Off";
        deleteAttr.value = "Off";
        editAttr.style.backgroundColor = "lightblue";
        deleteAttr.style.backgroundColor = "lightblue";
        title.innerHTML = "Add New Attribute Request"
        openPopUp();
    } else {
        addAttr.value = "Off";
        addAttr.style.backgroundColor = "lightblue";
        closePopUp()
    }
}
function editAttribute() {
    if (editAttr.value === "Off") {
        closePopUp();
        editAttr.value = "On";
        editAttr.style.backgroundColor = "#57fa6d";
        addAttr.value = "Off";
        deleteAttr.value = "Off";
        addAttr.style.backgroundColor = "lightblue";
        deleteAttr.style.backgroundColor = "lightblue";
        title.innerHTML = "Change Attribute Request"
        openPopUp();
    } else {
        editAttr.value = "Off";
        editAttr.style.backgroundColor = "lightblue";
        closePopUp()
    }
}
function deleteAttribute() {
    if (deleteAttr.value === "Off") {
        closePopUp();
        deleteAttr.value = "On";
        deleteAttr.style.backgroundColor = "#57fa6d";
        addAttr.value = "Off";
        editAttr.value = "Off";
        addAttr.style.backgroundColor = "lightblue";
        editAttr.style.backgroundColor = "lightblue";
        title.innerHTML = "Delete Attribute Request"
        openPopUp();
    } else {
        deleteAttr.value = "Off";
        deleteAttr.style.backgroundColor = "lightblue";
        closePopUp()
    }
}

function confirm() {
    if (addAttr.value === "On") {
        let value = typeAttributeText.value;
        if (url.value === "On") {
            addNewURL();
        } else if (func.value === "On") {
            addNewFUNC();
        } else if (param.value === "On") {
            addNewParam();
        }
        typeAttributeText.value = "";
    } else if (editAttr.value === "On") {
        if (url.value === "On") {
            let index = arr_url.findIndex((Element) => Element === typeAttributeSelect.value);
            if (isValidUrl(typeAttributeText.value)) {
                if (arr_url != null) {
                    let find = checkExist(typeAttributeText.value, arr_url);
                    if (find) {
                        alert("This url existed")
                    } else {
                        alert("url '" + arr_url[index] + "' has been changed");
                        arr_url[index] = typeAttributeText.value;
                    }
                } else {
                    if (arr_url[index] !== undefined) {
                        alert("url '" + arr_url[index] + "' has been changed");
                        arr_url[index] = typeAttributeText.value;
                    } else alert("No thing to change");
                }
            } else {
                alert("Just input URL, please input URL");
            }

        } else if (func.value === "On") {
            let index = arr_Function.findIndex((Element) => Element === typeAttributeSelect.value);
            if (typeAttributeText.value === "" || !typeAttributeText.value) {
                alert("Your input is null, please input Function");
            } else {
                if (arr_Function != null) {
                    let find = checkExist(typeAttributeText.value, arr_Function);
                    if (find) {
                        alert("This Function existed")
                    } else {
                        if (arr_Function[index] !== undefined) {
                            alert("Function '" + arr_Function[index] + "' has been changed");
                            arr_Function[index] = typeAttributeText.value;
                        } else alert("No thing to change");
                    }
                } else {
                    alert("Function '" + arr_Function[index] + "' has been changed");
                    arr_Function[index] = typeAttributeText.value;
                }
            }
        } else if (param.value === "On") {
            let index = arr_Parameter.findIndex((Element) => Element === typeAttributeSelect.value);
            if (typeAttributeText.value === "" || !typeAttributeText.value) {
                alert("Your input is null, please input Parameter");
            } else {
                if (arr_Parameter != null) {
                    let find = checkExist(typeAttributeText.value, arr_Parameter);
                    if (find) {
                        alert("This Parameter existed")
                    } else {
                        if (arr_Parameter[index] !== undefined) {
                            alert("Parameter '" + arr_Parameter[index] + "' has been changed");
                            arr_Parameter[index] = typeAttributeText.value;
                        } else alert("No thing to change");
                    }
                } else {
                    alert("Parameter '" + arr_Parameter[index] + "' has been changed");
                    arr_Parameter[index] = typeAttributeText.value;
                }
            }
        }
        updateLocalStorage();
        loadAttribute();
    } else if (deleteAttr.value === "On") {
        if (url.value === "On") {
            let index = arr_url.findIndex((Element) => Element === typeAttributeSelect.value);
            if (arr_url[index] !== undefined) {
                alert("url '" + arr_url[index] + "' has been deleted");
                arr_url.splice(index, 1);
            } else alert("No thing to delete");
        } else if (func.value === "On") {
            let index = arr_Function.findIndex((Element) => Element === typeAttributeSelect.value);
            if (arr_Function[index] !== undefined) {
                alert("Function '" + arr_Function[index] + "' has been deleted");
                arr_Function.splice(index, 1);
            } else alert("No thing to delete");
        } else if (param.value === "On") {
            let index = arr_Parameter.findIndex((Element) => Element === typeAttributeSelect.value);
            if (arr_Parameter[index] !== undefined) {
                alert("Parameter '" + arr_Parameter[index] + "' has been deleted");
                arr_Parameter.splice(index, 1);
            } else alert("No thing to delete");
        }
        updateLocalStorage();
        loadAttribute();
    }
    showValueLocalStorage();
}

function loadAttribute() {
    arr_url = [];
    arr_Function = [];
    arr_Parameter = [];
    typeAttributeSelect.innerHTML = "";
    if (isJson(localStorage.getItem(key_url))) {
        arr_url = JSON.parse(localStorage.getItem(key_url));
    } else arr_url.push(localStorage.getItem(key_url));
    if (isJson(localStorage.getItem(key_Function))) {
        arr_Function = JSON.parse(localStorage.getItem(key_Function));
    } else arr_Function.push(localStorage.getItem(key_Function));
    if (isJson(localStorage.getItem(key_Parameter))) {
        arr_Parameter = JSON.parse(localStorage.getItem(key_Parameter));
    } else arr_Parameter.push(localStorage.getItem(key_Parameter));
    if (url.value === "On") {
        if (arr_url !== null) {
            for (let i = 0; i < arr_url.length; i++) {
                typeAttributeSelect.innerHTML += `
            <option value=${arr_url[i]}>${arr_url[i]}</option>
          `
            }
        }
    } else if (func.value === "On") {
        if (arr_Function !== null) {
            for (let i = 0; i < arr_Function.length; i++) {
                typeAttributeSelect.innerHTML += `
              <option value=${arr_Function[i]}>${arr_Function[i]}</option>
            `
            }
        }
    } else if (param.value === "On") {
        if (arr_Parameter !== null) {
            for (let i = 0; i < arr_Parameter.length; i++) {
                typeAttributeSelect.innerHTML += `
              <option value=${arr_Parameter[i]}>${arr_Parameter[i]}</option>
            `
            }
        }
    }
    typeAttributeText.value = typeAttributeSelect.value;
}

function updateSelect() {
    typeAttributeText.value = typeAttributeSelect.value
}

function updateLocalStorage() {
    localStorage.setItem(key_url, JSON.stringify(arr_url));
    localStorage.setItem(key_Function, JSON.stringify(arr_Function));
    localStorage.setItem(key_Parameter, JSON.stringify(arr_Parameter));
}

function clearCommands() {
    domClass("logFile")[0].innerHTML = "";

}


var dataRequest = [];