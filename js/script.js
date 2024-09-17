class Note {
	constructor() {
		this.noteManager = NoteManager.getInstance();

		this.noteWrapper = document.createElement("div");
		this.noteWrapper.classList.add("note-wrapper");

		this.text = document.createElement("textarea");
		this.text.placeholder = messages["placeholder"];
		this.text.addEventListener("input", () => {
			this.noteManager.saveNotes();
		});

		this.removeButton = document.createElement("button");
		this.removeButton.classList.add("remove-button");
		this.removeButton.textContent = "remove";
		this.removeButton.addEventListener("click", () => {
			this.noteWrapper.remove();
			this.noteManager.notes = this.noteManager.notes.filter(
				(note) => note !== this
			);
			this.noteManager.saveNotes();
		});

		this.noteWrapper.appendChild(this.text);
		this.noteWrapper.appendChild(this.removeButton);
	}
}

class NoteManager {
	constructor() {
		this.notes = [];
		this.mostRecentStoredTime;
		NoteManager.instance = this;
	}

	static getInstance() {
		if (!NoteManager.instance) {
			NoteManager.instance = new NoteManager();
		}
		return NoteManager.instance;
	}

	getNoteCount() {
		return this.notes.length;
	}

	addNote() {
		const main = document.querySelector("main");

		const note = new Note();
		this.notes.push(note);

		main.insertBefore(note.noteWrapper, document.getElementById("add-button"));
		this.saveNotes();
	}

	displayTime(isReaderPage) {
		// Don't display time if no notes exist
		const time = document.getElementById("time");
		if (!this.notes.length) {
			time.textContent = messages["no-notes"];
			return;
		}

		const currentTime = new Date().toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true,
		});

		if (isReaderPage) {
			time.textContent = messages["retrieved-time"] + currentTime;
		} else {
			time.textContent = messages["stored-time"] + currentTime;
		}
	}

	displayAddButton() {
		const main = document.querySelector("main");

		const addButton = document.createElement("button");
		addButton.textContent = "Add Note";
		addButton.id = "add-button";

		addButton.addEventListener("click", () => {
			this.addNote();
		});

		main.appendChild(addButton);
	}

	saveNotes() {
		const notesToSave = this.notes.map((note) => note.text.value);
		localStorage.setItem("notes", JSON.stringify(notesToSave));
		this.displayTime();
	}

	clearNotes() {
		const main = document.querySelector("main");
		const backButton = document.querySelector(".back-button");
		const timeElement = document.getElementById("time");

		Array.from(main.children).forEach((child) => {
			if (child !== backButton && child !== timeElement) {
				main.removeChild(child);
			}
		});
	}

	displayNotes(isReaderPage) {
		const savedNotes = JSON.parse(localStorage.getItem("notes"));
		this.clearNotes();

		if (savedNotes) {
			savedNotes.forEach((noteContent) => {
				const note = new Note();
				note.text.value = noteContent;

				if (isReaderPage) {
					this.notes = []; // Prevent duplicated notes in the array
					note.removeButton.style.display = "none";
					note.text.readOnly = true;
				}

				this.notes.push(note);
				document
					.querySelector("main")
					.insertBefore(
						note.noteWrapper,
						document.getElementById("add-button")
					);
			});
		}
	}
}

function modifyHomeButtons() {
	const readerButton = document.getElementById("go-to-reader");
	const writerButton = document.getElementById("go-to-writer");

	readerButton.addEventListener("click", () => {
		window.location.href = "reader.html";
	});
	writerButton.addEventListener("click", () => {
		window.location.href = "writer.html";
	});
}

function intializePage() {
	const pageTitle = document.title;
	const noteManager = NoteManager.getInstance();

	let isReaderPage = pageTitle === "Reader";

	if (isReaderPage) {
		const interval = 2000;
		noteManager.displayNotes(isReaderPage);
		noteManager.displayTime(isReaderPage);

		setInterval(() => {
			noteManager.displayNotes(isReaderPage);
			noteManager.displayTime(isReaderPage);
		}, interval);
	} else if (document.title === "Writer") {
		noteManager.displayNotes(isReaderPage);
		noteManager.displayTime(isReaderPage);
		noteManager.displayAddButton();
	} else {
		modifyHomeButtons();
	}
}

document.addEventListener("DOMContentLoaded", intializePage);

document.addEventListener("DOMContentLoaded", () => {
	const backButton = document.querySelector(".back-button");
	if (backButton) {
		backButton.addEventListener("click", () => {
			window.location.href = "index.html";
		});
	}
});
