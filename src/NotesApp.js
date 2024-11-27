import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNote, setEditedNote] = useState({ title: '', content: '' });

 
  const fetchNotes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notes?page=${page}&limit=${limit}`);
      setNotes(response.data.notes);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [page, limit]);

  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

 
  const handleRowsPerPageChange = (event) => {
    const value = event.target.value;
    if (value === "") {
      setLimit(value);
    } else if (!isNaN(value) && value > 0) {
      setLimit(parseInt(value));
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  };


const handleAddNote = async () => {
    if (newNote.title && newNote.content) {
      try {
        const response = await axios.post('http://localhost:5000/api/notes', newNote);
        console.log('New note added:', response.data);
        window.location.reload();
      } catch (error) {
        console.error('Error adding note:', error);
      }
    } else {
      alert("Title and content are required!");
    }
  };
  


  const handleEditNote = (noteId) => {
    setEditingNoteId(noteId);
    const noteToEdit = notes.find(note => note._id === noteId);
    setEditedNote({
      title: noteToEdit.title,
      content: noteToEdit.content,
    });
  };

  
  const handleSaveEdit = async (noteId) => {
    if (editedNote.title && editedNote.content) {
      try {
        const response = await axios.put(`http://localhost:5000/api/notes/${noteId}`, editedNote);
        fetchNotes();
        setEditingNoteId(null);
        setEditedNote({ title: '', content: '' });
      } catch (error) {
        console.error('Error updating note:', error);
      }
    } else {
      alert("Title and content are required!");
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditedNote({ title: '', content: '' });
  };


  const handleDeleteNote = async (noteId) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="container">
      <h1>Notes</h1>
      <div>
        <input
          type="text"
          name="title"
          placeholder="Note Title"
          value={newNote.title}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="content"
          placeholder="Note Content"
          value={newNote.content}
          onChange={handleInputChange}
        />
        <button onClick={handleAddNote} disabled={!newNote.title || !newNote.content}>
          Add Note
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((note) => (
            <tr key={note._id}>
              <td>
                {editingNoteId === note._id ? (
                  <input
                    type="text"
                    value={editedNote.title}
                    onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                  />
                ) : (
                  note.title
                )}
              </td>
              <td>
                {editingNoteId === note._id ? (
                  <input
                    type="text"
                    value={editedNote.content}
                    onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                  />
                ) : (
                  note.content
                )}
              </td>
              <td>{new Date(note.createdAt).toLocaleString()}</td>
              <td>
                {editingNoteId === note._id ? (
                  <>
                    <button onClick={() => handleSaveEdit(note._id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditNote(note._id)}>Edit</button>
                    <button onClick={() => handleDeleteNote(note._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span> Page {page} of {totalPages} </span>
        <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
          Next
        </button>
        <input
          type="number"
          value={limit}
          onChange={handleRowsPerPageChange}
          min="1"
          max="100"
          style={{ width: '80px' }}
        />
      </div>
    </div>
  );
};

export default NotesApp;
