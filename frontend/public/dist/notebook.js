"use strict";
const blocs = document.querySelectorAll(".bloc");
const subblocs = document.querySelectorAll(".subbloc");
const addBlocBtn = document.getElementById("addBlocBtn");
const addSubblocBtns = document.querySelectorAll(".addSubblocBtn");
let subblocCounter = 3; // Start with a counter for new subblocs
function addDragAndDropListeners(element) {
    element.addEventListener("dragstart", (event) => {
        var _a;
        const e = event;
        (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", e.target.id);
    });
    element.addEventListener("dragover", (event) => {
        event.preventDefault();
        const e = event;
        const target = e.target;
        if (target.classList.contains("subbloc") ||
            target.classList.contains("bloc")) {
            target.classList.add("dragover");
        }
    });
    element.addEventListener("dragleave", (event) => {
        const e = event;
        const target = e.target;
        if (target.classList.contains("subbloc") ||
            target.classList.contains("bloc")) {
            target.classList.remove("dragover");
        }
    });
    element.addEventListener("drop", (event) => {
        var _a;
        event.preventDefault();
        const e = event;
        const target = e.target;
        const id = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
        const draggable = document.getElementById(id);
        if (draggable) {
            target.classList.remove("dragover");
            const bloc = target.closest(".bloc");
            if (bloc) {
                if (target.classList.contains("subbloc")) {
                    const targetRect = target.getBoundingClientRect();
                    const targetMidpoint = targetRect.top + targetRect.height / 2;
                    if (e.clientY < targetMidpoint) {
                        bloc.insertBefore(draggable, target);
                    }
                    else {
                        bloc.insertBefore(draggable, target.nextSibling);
                    }
                }
                else {
                    bloc.appendChild(draggable);
                }
            }
        }
    });
}
function addExpandListener(arrow) {
    arrow.addEventListener("click", () => {
        const subbloc = arrow.parentElement;
        const body = subbloc.querySelector(".subbloc-body");
        if (body.style.display === "none" || body.style.display === "") {
            body.style.display = "block";
            arrow.innerHTML = "&#9650;"; // Change to up arrow
        }
        else {
            body.style.display = "none";
            arrow.innerHTML = "&#9660;"; // Change to down arrow
        }
    });
}
function makeContentEditable(element) {
    element.setAttribute("contenteditable", "true");
    element.addEventListener("dragstart", (event) => event.preventDefault()); // Prevent dragging
}
subblocs.forEach((subbloc) => {
    addDragAndDropListeners(subbloc);
    const arrow = subbloc.querySelector(".expand-arrow");
    addExpandListener(arrow);
    makeContentEditable(subbloc.querySelector(".subbloc-title"));
    makeContentEditable(subbloc.querySelector(".subbloc-body"));
});
blocs.forEach((bloc) => {
    addDragAndDropListeners(bloc);
    const addSubblocBtn = bloc.querySelector(".addSubblocBtn");
    addSubblocBtn === null || addSubblocBtn === void 0 ? void 0 : addSubblocBtn.addEventListener("click", () => {
        var _a;
        const newSubbloc = document.createElement("div");
        newSubbloc.className = "subbloc";
        newSubbloc.draggable = true;
        newSubbloc.id = `subbloc${subblocCounter++}`;
        newSubbloc.innerHTML = `
      <div class="subbloc-title" contenteditable="true">New Subbloc</div>
      <div class="subbloc-body" contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
      <div class="expand-arrow">&#9660;</div>
    `;
        bloc.insertBefore(newSubbloc, (_a = bloc.querySelector("h2")) === null || _a === void 0 ? void 0 : _a.nextSibling);
        addDragAndDropListeners(newSubbloc);
        const arrow = newSubbloc.querySelector(".expand-arrow");
        addExpandListener(arrow);
        makeContentEditable(newSubbloc.querySelector(".subbloc-title"));
        makeContentEditable(newSubbloc.querySelector(".subbloc-body"));
    });
});
addBlocBtn === null || addBlocBtn === void 0 ? void 0 : addBlocBtn.addEventListener("click", () => {
    const board = document.querySelector(".board");
    if (board) {
        const newBloc = document.createElement("div");
        newBloc.className = "bloc";
        newBloc.innerHTML = `<button class="addSubblocBtn">+ Add Subbloc</button><h2 class="bloc-title" contenteditable="true">New Bloc</h2>`;
        board.appendChild(newBloc);
        addDragAndDropListeners(newBloc);
        const addSubblocBtn = newBloc.querySelector(".addSubblocBtn");
        addSubblocBtn === null || addSubblocBtn === void 0 ? void 0 : addSubblocBtn.addEventListener("click", () => {
            var _a;
            const newSubbloc = document.createElement("div");
            newSubbloc.className = "subbloc";
            newSubbloc.draggable = true;
            newSubbloc.id = `subbloc${subblocCounter++}`;
            newSubbloc.innerHTML = `
        <div class="subbloc-title" contenteditable="true">New Subbloc</div>
        <div class="subbloc-body" contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
        <div class="expand-arrow">&#9660;</div>
      `;
            newBloc.insertBefore(newSubbloc, (_a = newBloc.querySelector("h2")) === null || _a === void 0 ? void 0 : _a.nextSibling);
            addDragAndDropListeners(newSubbloc);
            const arrow = newSubbloc.querySelector(".expand-arrow");
            addExpandListener(arrow);
            makeContentEditable(newSubbloc.querySelector(".subbloc-title"));
            makeContentEditable(newSubbloc.querySelector(".subbloc-body"));
        });
    }
});
