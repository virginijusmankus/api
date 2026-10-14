import React, {useState, useEffect, useRef} from "react"

import './App.css'


function App(){
  const [albums, setAlbums] = useState([])
  const [form, setForm] = useState({title:"", artist: "", year: ""})
  const [editId, setEditId] = useState(null)
  const [sortBy, setSortBy] = useState("title")

  const albumListRef = useRef(null)
  const scrollToAlbums=(bottom=false)=>{
    if(albumListRef.current){
      albumListRef.current.scrollIntoView({behavior: "smooth", block: bottom? "end":"start"})
    }
  }

const fetchAlbums = async()=>{
  const res = await fetch("http://localhost:5000/api/albums")
  const data = await res.json()
  setAlbums(data)
}
useEffect(()=>{
  fetchAlbums()
},[])
const sortedAlbums=[...albums].sort((a,b)=>{
  if(sortBy === "year") return a.year - b.year
  return a[sortBy].localeCompare(b[sortBy])
})
const handleChange =(field, value)=>{
  setForm({...form, [field]: value})
}
const handleSubmit = async(e)=>{
  e.preventDefault()
  const method = editId? "PUT" : "POST"
  const url = editId
      ? `http://localhost:5000/api/albums/${editId}`
      : "http://localhost:5000/api/albums";

  await fetch(url, {
    method,
    headers: {'Content-Type': "application/json"},
    body: JSON.stringify(form)
  })
  setForm({title: "", artist:"", year:""})
  setEditId(null)
  await fetchAlbums()
  scrollToAlbums(true)
}
const handleDelete = async(id)=>{
  await fetch(`http://localhost:5000/api/albums/${id}`, {method: "DELETE"})
  fetchAlbums()
}

const handleEdit=(album)=>{
  setForm({title: album.title, artist:album.artist,year: album.year})
  setEditId(album._id)
  scrollToAlbums()
  
}
const handleCancelEdit=()=>{
  setEditId(null)
  setForm({title:"",artist:"", year:""})
}
return(
  <div className="App">
    <header className="App-header">
    <img src="/vinyl.svg" className="App-logo" alt="vinyl"/>
    <h1 style={{cursor: "pointer"}} onClick={scrollToAlbums}>Muzikos albumai</h1>
    </header>
    <form onSubmit={handleSubmit} className="form">
      <input placeholder="Pavadinimas" value={form.title} onChange={(e)=> handleChange("title", e.target.value)} required/>
      <input placeholder="Atlikėjas/Grupė" value={form.artist} onChange={(e)=> handleChange("artist", e.target.value)} required/>
      <input placeholder="Metai" value={form.year} onChange={(e)=> handleChange("year", e.target.value)} required/>
      <button type="submit">{editId? "Atnaujinti":"Pridėti"}</button>
      {editId && <button type="button" onClick={handleCancelEdit}>Atšaukti</button>}
    </form>

    <ul ref={albumListRef} className="albums">
    <div className="sort">
      <label>Rikiuoti pagal:</label>
      <select value={sortBy} onChange={(e)=> setSortBy(e.target.value)}>
        <option value="title">Pavadinimas</option>
        <option value="artist">Atlikėjas</option>
        <option value="year">Metai</option>
      </select>
    </div>
      {sortedAlbums.map((album)=>(
        <li key={album._id}>
          {editId === album._id ? (
              
              <div className="edit">
                <input
                  value={form.title} onChange={(e) => handleChange("title", e.target.value)}/>
                <input
                  value={form.artist} onChange={(e) => handleChange("artist", e.target.value)}/>
                <input
                  value={form.year} onChange={(e) => handleChange("year", e.target.value)}/>
                <button onClick={handleSubmit}>Išsaugoti</button>
                <button onClick={handleCancelEdit}>Atšaukti</button>
              </div>
            ) : (
              <>
                <span><strong>{album.title}</strong> - {album.artist} ({album.year})</span>
                <div>
                  <button onClick={() => handleEdit(album)}>Koreguoti</button>
                  <button onClick={() => handleDelete(album._id)}>Trinti</button>
                </div>
              </>
            )}
          </li>
      ))}
    </ul>
    <footer className="footer">2025, Kaunas</footer>
    
  </div>
)
}

export default App