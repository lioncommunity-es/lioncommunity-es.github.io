const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const imageInput = $("#image-input");
const itemsSection = $("#selector-items");
const resetButton = $("#reset-crafting-button");
const saveButton = $("#save-crafting-button");
const saveJsonButton = $("#save-json-crafting-button");
const jsonInput = $("#json-input");

const contextMenu = document.getElementById("context-menu");
const menuItems = contextMenu.querySelectorAll(".citem");

const contextMenuDelete = document.getElementById("context-menu-delete");
const menuItemsDelete = contextMenuDelete.querySelectorAll(".citem");

function createItem(src) {
	const divElement = document.createElement("div");
	divElement.oncontextmenu = itemContextMenu;
	const imgElement = document.createElement("img");
	const infoElement = document.createElement("span");
	divElement.appendChild(imgElement);
	divElement.appendChild(infoElement);
	divElement.draggable = true;
	imgElement.src = src;
	divElement.className = "item-image";

	divElement.dataset.name = "Nombre";
	divElement.dataset.quantity = "1";
	infoElement.innerText = "x1 Nombre";

	divElement.addEventListener("dragstart", handleDragStart);
	divElement.addEventListener("dragend", handleDragEnd);

	itemsSection.appendChild(divElement);
	return divElement;
}

function useFilesToCreateItems(files) {
	if (files && files.length > 0) {
		Array.from(files).forEach((file) => {
			const reader = new FileReader();

			reader.onload = (eventReader) => {
				createItem(eventReader.target.result);
			};

			reader.readAsDataURL(file);
		});
	}
}

imageInput.addEventListener("change", (event) => {
	const { files } = event.target;
	useFilesToCreateItems(files);
});

itemsSection.addEventListener("click", (event) => {
	const { target } = event;
	target.querySelector("input")?.click();
});

const itemContextMenu = (event) => {
	const { target } = event;
	event.preventDefault();
	contextMenu.style.display = "none";
	contextMenuDelete.style.display = "none";
	$(".cselected")?.classList.remove("cselected");
	if (target.parentElement.id === "selector-items") {
		contextMenuDelete.style.display = "block";
		contextMenuDelete.style.left = `${event.clientX}px`;
		contextMenuDelete.style.top = `${event.clientY}px`;
		target.classList.add("cselected");
		return;
	}
	contextMenu.style.display = "block";
	contextMenu.style.left = `${event.clientX}px`;
	contextMenu.style.top = `${event.clientY}px`;
	target.classList.add("cselected");
};

let draggedElement = null;
let sourceContainer = null;

const rows = $$(".crafting .item");
const rowsElements = $$(".crafting .elements");

rows.forEach((row) => {
	row.addEventListener("dragover", handleDragOver);
	row.addEventListener("drop", handleDrop);
	row.addEventListener("dragleave", handleDragLeave);
});

rowsElements.forEach((row) => {
	row.addEventListener("dragover", handleDragOver);
	row.addEventListener("drop", handleDrop);
	row.addEventListener("dragleave", handleDragLeave);
});

itemsSection.addEventListener("dragover", handleDragOver);
itemsSection.addEventListener("drop", handleDrop);
itemsSection.addEventListener("dragleave", handleDragLeave);

itemsSection.addEventListener("drop", handleDropFromDesktop);
itemsSection.addEventListener("dragover", handleDragOverFromDesktop);

jsonInput.addEventListener("change", (event) => {
	const file = event.target.files[0];
	const reader = new FileReader();
	reader.readAsText(file);

	reader.onload = (eventReader) => {
		const json = JSON.parse(eventReader.target.result);
		const craftingContainer = $(".crafting");
		craftingContainer.innerHTML = "";
		json.forEach((item) => {
			const itemElement = createItem(item.item.src);
			const itemEl = document.createElement("div");
			itemEl.className = "item";
			itemElement.dataset.name = item.item.name;
			itemElement.dataset.quantity = item.item.quantity;
			const row = document.createElement("div");
			const i = document.createElement("i");
			i.classList.add("fa-solid", "fa-right-long");
			row.className = "row";
			itemEl.appendChild(itemElement);
			row.appendChild(itemEl);
			row.appendChild(i);
			const elements = document.createElement("div");
			elements.className = "elements";
			item.ingredients.forEach((ingredient) => {
				ingredient.forEach((item) => {
					const itemElement = createItem(item.src);
					itemElement.dataset.name = item.name;
					itemElement.dataset.quantity = item.quantity;
					elements.appendChild(itemElement);
				});
			});
			row.appendChild(elements);
			itemEl.addEventListener("dragover", handleDragOver);
			itemEl.addEventListener("drop", handleDrop);
			itemEl.addEventListener("dragleave", handleDragLeave);
			craftingContainer.appendChild(row);
			elements.addEventListener("dragover", handleDragOver);
			elements.addEventListener("drop", handleDrop);
			elements.addEventListener("dragleave", handleDragLeave);
		});
	};
});

function handleDragOverFromDesktop(event) {
	event.preventDefault();

	const { currentTarget, dataTransfer } = event;

	if (dataTransfer.types.includes("Files")) {
		currentTarget.classList.add("drag-files");
	}
}

function handleDropFromDesktop(event) {
	event.preventDefault();
	const { currentTarget, dataTransfer } = event;

	if (dataTransfer.types.includes("Files")) {
		currentTarget.classList.remove("drag-files");
		const { files } = dataTransfer;
		useFilesToCreateItems(files);
	}
}

function handleDrop(event) {
	event.preventDefault();

	const { currentTarget, dataTransfer } = event;

	if (sourceContainer && draggedElement) {
		sourceContainer.removeChild(draggedElement);
	}

	if (draggedElement) {
		const src = dataTransfer.getData("text/plain");
		const imgElement = createItem(src);
		currentTarget.appendChild(imgElement);
	}

	currentTarget.classList.remove("drag-over");
	currentTarget.querySelector(".drag-preview")?.remove();
}

function handleDragOver(event) {
	event.preventDefault();

	const { currentTarget } = event;
	if (sourceContainer === currentTarget) return;

	currentTarget.classList.add("drag-over");

	const dragPreview = document.querySelector(".drag-preview");

	if (draggedElement && !dragPreview) {
		const previewElement = draggedElement.cloneNode(true);
		previewElement.classList.add("drag-preview");
		currentTarget.appendChild(previewElement);
	}
}

function handleDragLeave(event) {
	event.preventDefault();

	const { currentTarget } = event;
	currentTarget.classList.remove("drag-over");
	currentTarget.querySelector(".drag-preview")?.remove();
}

function handleDragStart(event) {
	draggedElement = event.target;
	sourceContainer = draggedElement.parentNode;
	event.dataTransfer.setData(
		"text/plain",
		draggedElement.querySelector("img").src
	);
}

function handleDragEnd(event) {
	draggedElement = null;
	sourceContainer = null;
}

resetButton.addEventListener("click", () => {
	const items = $$(".crafting .item-image");
	items.forEach((item) => {
		item.remove();
		itemsSection.appendChild(item);
	});
});

saveButton.addEventListener("click", () => {
	const craftingContainer = $(".crafting");
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	import("https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm").then(
		({ default: html2canvas }) => {
			html2canvas(craftingContainer).then((canvas) => {
				ctx.drawImage(canvas, 0, 0);
				const imgURL = canvas.toDataURL("image/png");

				const downloadLink = document.createElement("a");
				downloadLink.download = "crafting.png";
				downloadLink.href = imgURL;
				downloadLink.click();
			});
		}
	);
});

saveJsonButton.addEventListener("click", () => {
	const items = $$(".crafting .row");
	let result = [];

	items.forEach((row, index) => {
		const item = row.querySelector(".item .item-image");
		if (!item) return;
		const itemsSrc = item.querySelector("img").src;
		const itemName = item.dataset["name"];
		const itemQuantity = item.dataset["quantity"];

		let ingredients = [];

		const items = row.querySelectorAll(".elements .item-image");
		if (!items || items.length === 0) return;
		const itemsData = Array.from(items).map((item, index) => {
			const itemsSrc = item.querySelector("img").src;
			const itemName = item.dataset["name"];
			const itemQuantity = item.dataset["quantity"];
			console.log({ itemName, itemQuantity });
			return {
				name: itemName,
				quantity: itemQuantity,
				src: itemsSrc,
			};
		});

		ingredients.push(itemsData);
		result.push({
			item: {
				name: itemName,
				quantity: itemQuantity,
				src: itemsSrc,
			},
			ingredients,
		});
	});

	if (result.length === 0) {
		alert(
			"No se ha podido guardar la receta, ya que no se ha insertado ningún elemento."
		);
		return;
	}

	const downloadLink = document.createElement("a");
	downloadLink.download = "crafting.json";
	downloadLink.href = `data:text/json;charset=utf-8,${encodeURIComponent(
		JSON.stringify(result, null, 2)
	)}`;
	downloadLink.click();
});

document.addEventListener("click", (e) => {
	if (!contextMenu.contains(e.target)) {
		contextMenu.style.display = "none";
		$(".cselected")?.classList.remove("cselected");
	}
	if (!contextMenuDelete.contains(e.target)) {
		contextMenuDelete.style.display = "none";
		$(".cselected")?.classList.remove("cselected");
	}
});

menuItems.forEach((item) => {
	item.addEventListener("click", (e) => {
		const action = item.getAttribute("data-action");
		if (action === "remove") {
			const item = $(".cselected");
			item.remove();
		}

		if (action === "changequant") {
			const item = $(".cselected");
			const quantity = prompt(
				"Introduce la cantidad",
				item.dataset.quantity
			);
			item.dataset.quantity = quantity;
			item.querySelector(
				"span"
			).innerText = `x${quantity} ${item.dataset.name}`;
		}

		if (action === "changename") {
			const item = $(".cselected");
			const name = prompt("Introduce el nombre", item.dataset.name);
			item.dataset.name = name;
			item.querySelector(
				"span"
			).innerText = `x${item.datasetquantity} ${name}`;
		}

		if (action === "showinfo") {
			const item = $(".cselected");
			const name = item.dataset.name;
			const quantity = item.dataset.quantity;
			alert(`Nombre: ${name}\nCantidad: ${quantity}`);
		}

		$(".cselected")?.classList.remove("cselected");
		contextMenu.style.display = "none";
	});
});

menuItemsDelete.forEach((item) => {
	item.addEventListener("click", (e) => {
		const action = item.getAttribute("data-action");
		if (action === "remove") {
			const item = $(".cselected");
			item.remove();
		}
		$(".cselected")?.classList.remove("cselected");
		contextMenuDelete.style.display = "none";
	});
});
