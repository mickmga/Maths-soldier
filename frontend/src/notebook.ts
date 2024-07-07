import { Store } from "redux";
import store, { RootState } from "./store";

const blocs = document.querySelectorAll(".bloc");
const subblocs = document.querySelectorAll(".subbloc");
const addBlocBtn = document.getElementById("addBlocBtn");
const addSubblocBtns = document.querySelectorAll(".addSubblocBtn");

interface Window {
  store: Store<RootState>;
}

window.store = store;

let subblocCounter = 3; // Start with a counter for new subblocs

function addDragAndDropListeners(element: HTMLElement) {
  element.addEventListener("dragstart", (event) => {
    const e = event as DragEvent;
    e.dataTransfer?.setData("text/plain", (e.target as HTMLElement).id);
  });

  element.addEventListener("dragover", (event) => {
    event.preventDefault();
    const e = event as DragEvent;
    const target = e.target as HTMLElement;
    if (
      target.classList.contains("subbloc") ||
      target.classList.contains("bloc")
    ) {
      target.classList.add("dragover");
    }
  });

  element.addEventListener("dragleave", (event) => {
    const e = event as DragEvent;
    const target = e.target as HTMLElement;
    if (
      target.classList.contains("subbloc") ||
      target.classList.contains("bloc")
    ) {
      target.classList.remove("dragover");
    }
  });

  element.addEventListener("drop", (event) => {
    event.preventDefault();
    const e = event as DragEvent;
    const target = e.target as HTMLElement;
    const id = e.dataTransfer?.getData("text/plain");
    const draggable = document.getElementById(id!);

    if (draggable) {
      target.classList.remove("dragover");
      const bloc = target.closest(".bloc");

      if (bloc) {
        if (target.classList.contains("subbloc")) {
          const targetRect = target.getBoundingClientRect();
          const targetMidpoint = targetRect.top + targetRect.height / 2;

          if (e.clientY < targetMidpoint) {
            bloc.insertBefore(draggable, target);
          } else {
            bloc.insertBefore(draggable, target.nextSibling);
          }

          const position = Array.from(bloc.children).indexOf(draggable);
        } else {
          bloc.appendChild(draggable);
        }
      }
    }
  });
}

function addExpandListener(arrow: HTMLElement) {
  arrow.addEventListener("click", () => {
    const subbloc = arrow.parentElement as HTMLElement;
    const body = subbloc.querySelector(".subbloc-body") as HTMLElement;
    if (body.style.display === "none" || body.style.display === "") {
      body.style.display = "block";
      arrow.innerHTML = "&#9650;"; // Change to up arrow
    } else {
      body.style.display = "none";
      arrow.innerHTML = "&#9660;"; // Change to down arrow
    }
  });
}

function makeContentEditable(element: HTMLElement) {
  element.setAttribute("contenteditable", "true");
  element.addEventListener("dragstart", (event) => event.preventDefault()); // Prevent dragging
}

subblocs.forEach((subbloc) => {
  addDragAndDropListeners(subbloc as HTMLElement);
  const arrow = subbloc.querySelector(".expand-arrow") as HTMLElement;
  addExpandListener(arrow);
  makeContentEditable(subbloc.querySelector(".subbloc-title") as HTMLElement);
  makeContentEditable(subbloc.querySelector(".subbloc-body") as HTMLElement);
});

blocs.forEach((bloc) => {
  addDragAndDropListeners(bloc as HTMLElement);
  const addSubblocBtn = bloc.querySelector(".addSubblocBtn");
  addSubblocBtn?.addEventListener("click", () => {
    const newSubbloc = document.createElement("div");
    newSubbloc.className = "subbloc";
    newSubbloc.draggable = true;
    newSubbloc.id = `subbloc${subblocCounter++}`;
    newSubbloc.innerHTML = `
      <div class="subbloc-title" contenteditable="true">New Subbloc</div>
      <div class="subbloc-body" contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
      <div class="expand-arrow">&#9660;</div>
    `;
    bloc.insertBefore(
      newSubbloc,
      bloc.querySelector("h2")?.nextSibling as Node
    );
    addDragAndDropListeners(newSubbloc);
    const arrow = newSubbloc.querySelector(".expand-arrow") as HTMLElement;
    addExpandListener(arrow);
    makeContentEditable(
      newSubbloc.querySelector(".subbloc-title") as HTMLElement
    );
    makeContentEditable(
      newSubbloc.querySelector(".subbloc-body") as HTMLElement
    );
  });
});

addBlocBtn?.addEventListener("click", () => {
  const board = document.querySelector(".board");
  if (board) {
    const newBloc = document.createElement("div");
    newBloc.className = "bloc";
    newBloc.innerHTML = `<button class="addSubblocBtn">+ Add Subbloc</button><h2 class="bloc-title" contenteditable="true">New Bloc</h2>`;
    board.appendChild(newBloc);
    addDragAndDropListeners(newBloc);

    const addSubblocBtn = newBloc.querySelector(".addSubblocBtn");
    addSubblocBtn?.addEventListener("click", () => {
      const newSubbloc = document.createElement("div");
      newSubbloc.className = "subbloc";
      newSubbloc.draggable = true;
      newSubbloc.id = `subbloc${subblocCounter++}`;
      newSubbloc.innerHTML = `
        <div class="subbloc-title" contenteditable="true">New Subbloc</div>
        <div class="subbloc-body" contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</div>
        <div class="expand-arrow">&#9660;</div>
      `;
      newBloc.insertBefore(
        newSubbloc,
        newBloc.querySelector("h2")?.nextSibling as Node
      );
      addDragAndDropListeners(newSubbloc);
      const arrow = newSubbloc.querySelector(".expand-arrow") as HTMLElement;
      addExpandListener(arrow);
      makeContentEditable(
        newSubbloc.querySelector(".subbloc-title") as HTMLElement
      );
      makeContentEditable(
        newSubbloc.querySelector(".subbloc-body") as HTMLElement
      );
    });
  }
});

const renderNotes = () => {
  const sections = window.store.getState().localStorage.sections;
  //collect store
  //for each section, render a bloc
};

window.onload = () => {
  console.log(window.store.getState());
};
