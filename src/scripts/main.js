// Define custom element <notification-message>
class Notification extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const type = this.getAttribute('type') || 'info';
    const message = this.getAttribute('message') || 'Notification message';

    this.innerHTML = `
      <div class="notification ${type}">
        <span>${message}</span>
        <button class="close">&times;</button>
      </div>
    `;

    const closeButton = this.querySelector('.close');
    closeButton.addEventListener('click', () => {
      this.remove();
    });
  }
}

customElements.define('notification-message', Notification);

// Define custom element <note-item>
class NoteItem extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const data = JSON.parse(this.getAttribute('data'));
    this.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
          <p class="card-text">${data.body}</p>
          <button type="button" class="btn btn-danger button-delete" data-id="${data.id}">Delete</button>
        </div>
      </div>
    `;

    const deleteButton = this.querySelector('.button-delete');
    deleteButton.addEventListener('click', async () => {
      const noteId = deleteButton.getAttribute('data-id');
      await removeBook(noteId);
      this.remove(); // Remove the note item from DOM
    });
  }
}

// Register custom element <note-item>
customElements.define('note-item', NoteItem);

// Function to render a new book
const renderNewBook = (data) => {
  const listBookElement = document.querySelector('#listBook');

  if (data.title.trim() !== '' && data.body.trim() !== '') {
    const noteItem = document.createElement('note-item');
    noteItem.setAttribute('data', JSON.stringify(data));
    listBookElement.appendChild(noteItem);
  }
};

// Define custom element <note-app>
class NoteApp extends HTMLElement {
  constructor() {
    super();
  }
 
  connectedCallback() {
    this.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title">Input Catatan woi!</h5>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label for="inputBookTitle">Title</label>
                  <input id="inputBookTitle" type="text" class="form-control" placeholder="Judul Buku">
                </div>
                <div class="form-group">
                  <label for="inputBookAuthor">Body</label>
                  <input id="inputBookAuthor" type="text" class="form-control" placeholder="Pengarang">
                </div>
                <div class="form-group">
                  <button id="buttonSave" class="btn btn-success">Save</button>
                  <button id="buttonUpdate" class="btn btn-primary">Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <div id="listBook" class="row">
          <!-- Loader ditambahkan di sini -->
          <div class="loader"></div>
        </div>
      </div>
    `;
 
    // Panggil fungsi untuk menampilkan catatan dari local storage
    displayNotesFromLocalStorage();
  }
}
 
// Daftarkan custom element <note-app>
customElements.define('note-app', NoteApp);
 
// Function to get books from API
const baseUrl = 'https://notes-api.dicoding.dev/v2';
 
const getBook = async () => {
  try {
    const response = await fetch(`${baseUrl}/notes`);
    if (response.ok) {
      const responseData = await response.json();
      renderBooks(responseData.data);
    } else {
      showResponseMessage('Failed to retrieve notes. Please check your internet connection.');
    }
  } catch (error) {
    showResponseMessage('Failed to retrieve notes. Please check your internet connection.');
  }
};
 
// Function to insert a new book
const insertBook = async (data) => {
  try {
    const response = await fetch(`${baseUrl}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      const responseData = await response.json();
      renderNewBook(responseData.data);
      saveNoteToLocalStorage(responseData.data.id, responseData.data.title, responseData.data.body);
    } else {
      showResponseMessage('Failed to save note. Please try again later.');
    }
  } catch (error) {
    showResponseMessage('Failed to save note. Please try again later.');
  }
};
 
// Function to remove a book
const removeBook = async (noteId) => {
  try {
    const response = await fetch(`${baseUrl}/notes/${noteId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      showResponseMessage('Failed to delete note. Please try again later.');
    }
  } catch (error) {
    showResponseMessage('Failed to delete note. Please try again later.');
  }
  await getBook(); // Moved the call inside try block to ensure it's called regardless of success or failure
};
 
// Function to render existing books
const renderBooks = (data) => {
  const listBookElement = document.querySelector('#listBook');
  listBookElement.innerHTML = '';
 
  data.forEach(data => {
    if (data.title.trim() !== '' && data.body.trim() !== '') {
      const card = document.createElement('note-item');
      card.setAttribute('data', JSON.stringify(data));
      listBookElement.appendChild(card);

      const deleteButton = card.querySelector('.button-delete');
      deleteButton.addEventListener('click', async () => {
        const noteId = deleteButton.getAttribute('data-id');
        await removeBook(noteId);
      });
    }
  });
};
 
// Function to display response message
const showResponseMessage = (message = 'Check your internet connection') => {
  alert(message);
};
 
// Event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const inputBookTitle = document.querySelector('#inputBookTitle');
  const inputBookAuthor = document.querySelector('#inputBookAuthor');
  const buttonSave = document.querySelector('#buttonSave');
 
  // Event listener for save button click
  buttonSave.addEventListener('click', async () => {
    const data = {
      title: inputBookTitle.value,
      body: inputBookAuthor.value
    };
 
    if (data.title.trim() !== '' && data.body.trim() !== '') {
      await insertBook(data);
    } else {
      showResponseMessage('Title and body cannot be empty');
    }
 
    inputBookTitle.value = '';
    inputBookAuthor.value = '';
  });
 
  // Call the function to get books
  getBook();
});
 
// Function to save note to local storage
function saveNoteToLocalStorage(id, title, body) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notes.push({ id, title, body }); // Updated to use shorthand property names
  localStorage.setItem("notes", JSON.stringify(notes));
  console.log("Catatan disimpan:", { id, title, body }); // Updated to use shorthand property names
}
 
// Function to display notes from local storage
function displayNotesFromLocalStorage() {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  notes.forEach(note => {
    renderNewBook(note);
  });
}
