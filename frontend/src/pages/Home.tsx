import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home(){
  const [q, setQ] = useState("");
  const nav = useNavigate();

  return (
      <div className="page">
        <aside className="sidebar" style={{display:"grid", alignContent:"center", gap:16}}>
          <h2 className="section-title">Find local food</h2>
          <div className="col">
            <input
                className="input"
                placeholder="What do you want to buy? (e.g. tomatoes)"
                value={q}
                onChange={e=>setQ(e.target.value)}
            />
            <button className="button" onClick={()=>nav(`/browse?q=${encodeURIComponent(q)}`)}>
              Search
            </button>
            <p className="footer-note">Type a product and we’ll show farmers on the map.</p>
          </div>
        </aside>

        <main className="content" style={{display:"grid", placeItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div className="logo-badge" style={{margin:"0 auto 12px", width:72, height:72, borderRadius:20, fontSize:30}}>🥕</div>
            <h1 style={{margin:0}}>Buy directly from farmers</h1>
            <p style={{opacity:.75}}>Fresh. Local. Fair.</p>
          </div>
        </main>
      </div>
  );
}
