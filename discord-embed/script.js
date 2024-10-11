const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const START = "bot";

const maxLengthControl = (element) => {
	element.addEventListener("input", () => {
		const text = element.value;
		const maxLength = element.getAttribute("maxlength");
		const length = text.length;
		const counter = element.parentElement.querySelector("span");
		counter.textContent = `${length}/${maxLength}`;
	});
};

window.changeType = (type) => {
	$(`span#${type}`)
		.parentElement.querySelectorAll("span[selected='true']")
		.forEach((element) => {
			element.setAttribute("selected", false);
		});
	$(`span#${type}`).setAttribute("selected", true);

	if (type === "bot") {
		$(".field-group#send").style.display = "none";
		$(".field-group#user").style.display = "none";
	} else {
		$(".field-group#send").style.display = "block";
		$(".field-group#user").style.display = "block";
	}
};

window.changeScreen = (screen) => {
	$$("aside li.active").forEach((element) => {
		element.classList.remove("active");
	});
	$(`aside li#open-${screen}`).classList.add("active");
};

$$("details").forEach((details) => {
	details.addEventListener("toggle", (event) => {
		if (event.target.open) {
			event.target.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	});
});

$$("input[type='color']").forEach((input) => {
	input.addEventListener("input", (event) => {
		const color = event.target.value;
		const text =
			event.target.parentElement.querySelector("input[type='text']");
		text.value = color.substring(1);
	});
});

$$("input[type='text'][maxlength]").forEach((input) => maxLengthControl(input));
$$("textarea[maxlength]").forEach((input) => maxLengthControl(input));

document.addEventListener("DOMContentLoaded", () => {
	changeType(START);
});
