document.addEventListener("DOMContentLoaded", () => {
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

		$(
			`aside li#open-${Array.isArray(screen) ? screen[0] : screen}`
		).classList.add("active");

		$$("main > section").forEach(
			(section) => (section.style.display = "none")
		);

		if (Array.isArray(screen)) {
			screen.forEach((sc) => ($(`#${sc}`).style.display = "block"));
		} else {
			$(`#${screen}`).style.display = "block";
		}
	};

	const addEmbed = () => {
		const embedTemplate = $("#embed").content.cloneNode(true);
		$("#embeds .content").appendChild(embedTemplate);
		refreshEventListeners();
		updatePreview();
	};

	const addComponentRow = () => {
		const rowTemplate = $("#row").content.cloneNode(true);
		$("#components .content").appendChild(rowTemplate);
		refreshEventListeners();
		updatePreview();
	};

	const addButton = (row) => {
		const buttonTemplate = $("#button").content.cloneNode(true);
		row.querySelector(".content").appendChild(buttonTemplate);
		refreshEventListeners();
		updatePreview();
	};

	const applyFormat = (textarea, format) => {
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = textarea.value.substring(start, end);
		let formattedText = "";

		switch (format) {
			case "bold":
				formattedText = `**${selectedText}**`;
				break;
			case "italic":
				formattedText = `*${selectedText}*`;
				break;
			case "underline":
				formattedText = `__${selectedText}__`;
				break;
			case "strikethrough":
				formattedText = `~~${selectedText}~~`;
				break;
		}

		textarea.value =
			textarea.value.substring(0, start) +
			formattedText +
			textarea.value.substring(end);
		textarea.focus();
		textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
	};

	const loadEmojis = () => {
		const emojiPicker = $("#emoji-picker");
		emojiPicker.innerHTML = "";

		const emojis = [
			"😀",
			"😃",
			"😄",
			"😁",
			"😆",
			"😅",
			"😂",
			"🤣",
			"😊",
			"😇",
			"🙂",
			"🙃",
			"😉",
			"😌",
			"😍",
			"🥰",
			"😘",
			"😗",
			"😙",
			"😚",
			"😋",
			"😛",
			"😝",
			"😜",
			"🤪",
			"🤨",
			"🧐",
			"🤓",
			"😎",
			"🤩",
			"🥳",
			"😏",
			"😒",
			"😞",
			"😔",
			"😟",
			"😕",
			"🙁",
			"☹️",
			"😣",
			"😖",
			"😫",
			"😩",
			"🥺",
			"😢",
			"😭",
			"😤",
			"😠",
			"😡",
			"🤬",
			"🤯",
			"😳",
			"🥵",
			"🥶",
			"😱",
			"😨",
			"😰",
			"😥",
			"😓",
			"🤗",
			"🤔",
			"🤭",
			"🤫",
			"🤥",
			"😶",
			"😐",
			"😑",
			"😬",
			"🙄",
			"😯",
			"😦",
			"😧",
			"😮",
			"😲",
			"🥱",
			"😴",
			"🤤",
			"😪",
			"😵",
			"🤐",
			"🥴",
			"🤢",
			"🤮",
			"🤧",
			"😷",
			"🤒",
			"🤕",
		];

		emojis.forEach((emoji) => {
			const button = document.createElement("button");
			button.textContent = emoji;
			button.addEventListener("click", () => {
				const textarea = $('textarea[name="content"]');
				const cursorPos = textarea.selectionStart;
				textarea.value =
					textarea.value.slice(0, cursorPos) +
					emoji +
					textarea.value.slice(cursorPos);
				textarea.focus();
				textarea.setSelectionRange(cursorPos + 2, cursorPos + 2);
				emojiPicker.classList.add("hidden");
				updatePreview();
			});
			emojiPicker.appendChild(button);
		});
	};

	const toggleEmojiPicker = () => {
		const emojiPicker = $("#emoji-picker");
		emojiPicker.classList.toggle("hidden");
		if (!emojiPicker.classList.contains("hidden")) {
			loadEmojis();
		}
	};

	const updateButtonVisibility = (buttonElement) => {
		const typeSelect = buttonElement.querySelector('select[name="type"]');
		const urlInput = buttonElement.querySelector(".agrupation#link");

		if (typeSelect.value === "link") {
			urlInput.style.display = "block";
		} else {
			urlInput.style.display = "none";
		}
	};

	const toggleDetails = (event) => {
		if (event.target.open) {
			event.target.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	};

	const colorInputHandler = (event) => {
		const color = event.target.value;
		const text =
			event.target.parentElement.querySelector("input[type='text']");
		text.value = color.substring(1);
	};

	const formatBTN = (event) => {
		const btn = event.target.closest("button");
		const format = btn.getAttribute("data-format");
		const textarea = $('textarea[name="content"]');
		applyFormat(textarea, format);
		updatePreview();
	};

	const linkOptionVisibility = (event) => {
		const select = event.target.closest("select");
		updateButtonVisibility(select.closest("details"));
		updatePreview();
	};

	const refreshEventListeners = () => {
		$$("details").forEach((details) => {
			details.addEventListener("toggle", toggleDetails);
		});

		$$("input[type='color']").forEach((input) => {
			input.addEventListener("input", colorInputHandler);
		});

		$$("input[type='text'][maxlength]").forEach((input) =>
			maxLengthControl(input)
		);
		$$("textarea[maxlength]").forEach((input) => maxLengthControl(input));

		$$(".format-btn").forEach((btn) => {
			btn.addEventListener("click", formatBTN);
		});

		$("#emoji-btn").addEventListener("click", toggleEmojiPicker);

		$$('select[name="type"]').forEach((select) => {
			select.addEventListener("change", linkOptionVisibility);
		});
	};

	const parseDiscordFormatting = (text) => {
		return text
			.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
			.replace(/\*(.*?)\*/g, "<em>$1</em>")
			.replace(/__(.*?)__/g, "<u>$1</u>")
			.replace(/~~(.*?)~~/g, "<del>$1</del>")
			.replace(/\n/g, "<br>");
	};

	const updatePreview = () => {
		const previewContent = $("#preview-content");
		const messageContent = previewContent.querySelector(".message-content");
		const embedsContainer = previewContent.querySelector(".embeds");
		const componentsContainer = previewContent.querySelector(".components");

		messageContent.innerHTML = "";
		embedsContainer.innerHTML = "";
		componentsContainer.innerHTML = "";

		const content = $('textarea[name="content"]').value;
		if (content) {
			messageContent.innerHTML = parseDiscordFormatting(content);
		}

		$$("#embeds .content > details").forEach((embed) => {
			const embedElement = document.createElement("div");
			embedElement.className = "embed";

			const color = embed.querySelector('input[name="color"]').value;
			embedElement.style.borderLeftColor = `#${color}`;

			const author = {
				name: embed.querySelector('input[name="author-name"]').value,
				url: embed.querySelector('input[name="author-url"]').value,
				icon_url: embed.querySelector('input[name="author-icon"]')
					.value,
			};

			if (author.name) {
				const authorElement = document.createElement("div");
				authorElement.className = "embed-author";
				if (author.icon_url) {
					const iconElement = document.createElement("img");
					iconElement.src = author.icon_url;
					authorElement.appendChild(iconElement);
				}
				const nameElement = document.createElement("span");
				nameElement.className = "embed-author-name";
				if (author.url) {
					const linkElement = document.createElement("a");
					linkElement.href = author.url;
					linkElement.textContent = author.name;
					nameElement.appendChild(linkElement);
				} else {
					nameElement.textContent = author.name;
				}
				authorElement.appendChild(nameElement);
				embedElement.appendChild(authorElement);
			}

			const title = embed.querySelector('input[name="etitle"]').value;
			if (title) {
				const titleElement = document.createElement("div");
				titleElement.className = "embed-title";
				titleElement.innerHTML = parseDiscordFormatting(title);
				embedElement.appendChild(titleElement);
			}

			const description = embed.querySelector(
				'textarea[name="edescription"]'
			).value;
			if (description) {
				const descriptionElement = document.createElement("div");
				descriptionElement.className = "embed-description";
				descriptionElement.innerHTML =
					parseDiscordFormatting(description);
				embedElement.appendChild(descriptionElement);
			}

			const thumbnailUrl = embed.querySelector(
				'input[name="thumbnail-url"]'
			).value;
			if (thumbnailUrl) {
				const thumbnailElement = document.createElement("img");
				thumbnailElement.className = "embed-thumbnail";
				thumbnailElement.src = thumbnailUrl;
				embedElement.appendChild(thumbnailElement);
			}

			const imageUrl = embed.querySelector(
				'input[name="image-url"]'
			).value;
			if (imageUrl) {
				const imageElement = document.createElement("img");
				imageElement.className = "embed-image";
				imageElement.src = imageUrl;
				embedElement.appendChild(imageElement);
			}

			const footer = {
				text: embed.querySelector('input[name="footer-text"]').value,
				icon_url: embed.querySelector('input[name="footer-image-url"]')
					.value,
			};

			const timestamp = {
				date: embed.querySelector('input[name="footer-timestamp-date"]')
					.value,
				time: embed.querySelector('input[name="footer-timestamp-time"]')
					.value,
			};

			if (footer.text || timestamp.date || timestamp.time) {
				const footerElement = document.createElement("div");
				footerElement.className = "embed-footer";
				if (footer.icon_url) {
					const iconElement = document.createElement("img");
					iconElement.src = footer.icon_url;
					footerElement.appendChild(iconElement);
				}
				const textElement = document.createElement("span");
				textElement.className = "embed-footer-text";
				textElement.innerHTML = parseDiscordFormatting(footer.text);
				footerElement.appendChild(textElement);

				if (timestamp.date || timestamp.time) {
					const separatorElement = document.createElement("span");
					separatorElement.className = "embed-footer-separator";
					separatorElement.textContent = "•";
					footerElement.appendChild(separatorElement);

					const timestampElement = document.createElement("span");
					timestampElement.textContent = `${timestamp.date} ${timestamp.time}`;
					footerElement.appendChild(timestampElement);
				}

				embedElement.appendChild(footerElement);
			}

			embedsContainer.appendChild(embedElement);
		});

		$$("#components .content > details").forEach((row) => {
			const rowElement = document.createElement("div");
			rowElement.className = "component-row";

			row.querySelectorAll(".content > details").forEach((button) => {
				const buttonElement = document.createElement("button");
				buttonElement.className = "component-button";
				buttonElement.innerHTML = parseDiscordFormatting(
					button.querySelector('input[name="b-text"]').value ||
						"Button"
				);

				const buttonType = button.querySelector(
					'select[name="type"]'
				).value;
				buttonElement.classList.add(buttonType);

				const emoji = button.querySelector('input[name="emoji"]').value;
				if (emoji) {
					const emojiElement = document.createElement("span");
					emojiElement.textContent = emoji;
					buttonElement.prepend(emojiElement);
				}

				const url = button.querySelector('input[name="b-url"]').value;
				if (url && buttonType === "link") {
					const linkElement = document.createElement("a");
					linkElement.href = url;
					linkElement.appendChild(buttonElement);
					rowElement.appendChild(linkElement);
				} else {
					rowElement.appendChild(buttonElement);
				}
			});

			componentsContainer.appendChild(rowElement);
		});
	};

	const saveEmbed = () => {
		const embed = {
			content: $('textarea[name="content"]').value,
			embeds: [],
			components: [],
		};

		$$("#embeds .content > details").forEach((embedElement) => {
			const embedData = {
				author: {
					name: embedElement.querySelector(
						'input[name="author-name"]'
					).value,
					url: embedElement.querySelector('input[name="author-url"]')
						.value,
					icon_url: embedElement.querySelector(
						'input[name="author-icon"]'
					).value,
				},
				title: embedElement.querySelector('input[name="etitle"]').value,
				description: embedElement.querySelector(
					'textarea[name="edescription"]'
				).value,
				color: embedElement.querySelector('input[name="color"]').value,
				thumbnail: {
					url: embedElement.querySelector(
						'input[name="thumbnail-url"]'
					).value,
				},
				image: {
					url: embedElement.querySelector('input[name="image-url"]')
						.value,
				},
				footer: {
					text: embedElement.querySelector(
						'input[name="footer-text"]'
					).value,
					icon_url: embedElement.querySelector(
						'input[name="footer-image-url"]'
					).value,
				},
				timestamp: `${
					embedElement.querySelector(
						'input[name="footer-timestamp-date"]'
					).value
				}T${
					embedElement.querySelector(
						'input[name="footer-timestamp-time"]'
					).value
				}`,
			};
			embed.embeds.push(embedData);
		});

		$$("#components .content > details").forEach((rowElement) => {
			const row = [];
			rowElement
				.querySelectorAll(".content > details")
				.forEach((buttonElement) => {
					const button = {
						type: buttonElement.querySelector('select[name="type"]')
							.value,
						label: buttonElement.querySelector(
							'input[name="b-text"]'
						).value,
						emoji: buttonElement.querySelector(
							'input[name="emoji"]'
						).value,
						url: buttonElement.querySelector('input[name="b-url"]')
							.value,
					};
					row.push(button);
				});
			embed.components.push(row);
		});

		let savedEmbeds = JSON.parse(
			localStorage.getItem("savedEmbeds") || "[]"
		);
		savedEmbeds.push(embed);
		localStorage.setItem("savedEmbeds", JSON.stringify(savedEmbeds));

		updateSavedEmbedsList();
	};

	const updateSavedEmbedsList = () => {
		const savedEmbedsList = $("#saved-embeds-list");
		savedEmbedsList.innerHTML = "";

		const savedEmbeds = JSON.parse(
			localStorage.getItem("savedEmbeds") || "[]"
		);
		savedEmbeds.forEach((embed, index) => {
			const li = document.createElement("li");
			li.textContent = `Embed ${index + 1}`;
			li.addEventListener("click", () => loadEmbed(embed));
			savedEmbedsList.appendChild(li);
		});
	};

	const loadEmbed = (embed) => {
		$('textarea[name="content"]').value = embed.content;

		$("#embeds .content").innerHTML = "";
		$("#components .content").innerHTML = "";

		embed.embeds.forEach((embedData) => {
			const embedElement = $("#embed").content.cloneNode(true);
			embedElement.querySelector('input[name="author-name"]').value =
				embedData.author.name;
			embedElement.querySelector('input[name="author-url"]').value =
				embedData.author.url;
			embedElement.querySelector('input[name="author-icon"]').value =
				embedData.author.icon_url;
			embedElement.querySelector('input[name="etitle"]').value =
				embedData.title;
			embedElement.querySelector('textarea[name="edescription"]').value =
				embedData.description;
			embedElement.querySelector('input[name="color"]').value =
				embedData.color;
			embedElement.querySelector('input[name="thumbnail-url"]').value =
				embedData.thumbnail.url;
			embedElement.querySelector('input[name="image-url"]').value =
				embedData.image.url;
			embedElement.querySelector('input[name="footer-text"]').value =
				embedData.footer.text;
			embedElement.querySelector('input[name="footer-image-url"]').value =
				embedData.footer.icon_url;

			const timestamp = new Date(embedData.timestamp);
			embedElement.querySelector(
				'input[name="footer-timestamp-date"]'
			).value = timestamp.toISOString().split("T")[0];
			embedElement.querySelector(
				'input[name="footer-timestamp-time"]'
			).value = timestamp.toTimeString().split(" ")[0];

			$("#embeds .content").appendChild(embedElement);
		});

		embed.components.forEach((row) => {
			const rowElement = $("#row").content.cloneNode(true);
			row.forEach((button) => {
				const buttonElement = $("#button").content.cloneNode(true);
				buttonElement.querySelector('select[name="type"]').value =
					button.type;
				buttonElement.querySelector('input[name="b-text"]').value =
					button.label;
				buttonElement.querySelector('input[name="emoji"]').value =
					button.emoji;
				buttonElement.querySelector('input[name="b-url"]').value =
					button.url;
				rowElement.querySelector(".content").appendChild(buttonElement);
			});
			$("#components .content").appendChild(rowElement);
		});

		refreshEventListeners();
		updatePreview();
	};

	const resetForm = () => {
		$('textarea[name="content"]').value = "";
		$("#embeds .content").innerHTML = "";
		$("#components .content").innerHTML = "";
		updatePreview();
	};

	const generateJSON = () => {
		const jsonData = {
			content: $('textarea[name="content"]').value,
			embeds: [],
			components: [],
		};

		$$("#embeds .content > details").forEach((embedElement) => {
			const embedData = {
				author: {
					name: embedElement.querySelector(
						'input[name="author-name"]'
					).value,
					url: embedElement.querySelector('input[name="author-url"]')
						.value,
					icon_url: embedElement.querySelector(
						'input[name="author-icon"]'
					).value,
				},
				title: embedElement.querySelector('input[name="etitle"]').value,
				description: embedElement.querySelector(
					'textarea[name="edescription"]'
				).value,
				color: parseInt(
					embedElement.querySelector('input[name="color"]').value,
					16
				),
				thumbnail: {
					url: embedElement.querySelector(
						'input[name="thumbnail-url"]'
					).value,
				},
				image: {
					url: embedElement.querySelector('input[name="image-url"]')
						.value,
				},
				footer: {
					text: embedElement.querySelector(
						'input[name="footer-text"]'
					).value,
					icon_url: embedElement.querySelector(
						'input[name="footer-image-url"]'
					).value,
				},
				timestamp: `${
					embedElement.querySelector(
						'input[name="footer-timestamp-date"]'
					).value
				}T${
					embedElement.querySelector(
						'input[name="footer-timestamp-time"]'
					).value
				}`,
			};
			jsonData.embeds.push(embedData);
		});

		$$("#components .content > details").forEach((rowElement) => {
			const row = [];
			rowElement
				.querySelectorAll(".content > details")
				.forEach((buttonElement) => {
					const button = {
						type: 2,
						style:
							buttonElement.querySelector('select[name="type"]')
								.value === "link"
								? 5
								: 1,
						label: buttonElement.querySelector(
							'input[name="b-text"]'
						).value,
						emoji: buttonElement.querySelector(
							'input[name="emoji"]'
						).value,
						url: buttonElement.querySelector('input[name="b-url"]')
							.value,
					};
					row.push(button);
				});
			jsonData.components.push({ type: 1, components: row });
		});

		const jsonString = JSON.stringify(jsonData, null, 2);
		const blob = new Blob([jsonString], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "discord_embed.json";
		a.click();
		URL.revokeObjectURL(url);
	};

	$("#add-embed").addEventListener("click", addEmbed);
	$("#add-row").addEventListener("click", addComponentRow);
	$("#components").addEventListener("click", (e) => {
		if (e.target.id === "add-button") {
			const row = e.target.closest("details");
			addButton(row);
		}
	});

	$("main").addEventListener("input", updatePreview);
	$("#save-embed").addEventListener("click", saveEmbed);
	$("#reset").addEventListener("click", resetForm);
	$("#json").addEventListener("click", generateJSON);

	changeType(START);
	updateSavedEmbedsList();
	refreshEventListeners();

	$$('select[name="type"]').forEach((select) => {
		updateButtonVisibility(select.closest("details"));
	});
});
