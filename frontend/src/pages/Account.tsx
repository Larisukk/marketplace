export default function Account(){
  return (
    <div className="page">
      <aside className="sidebar">
        <h2 className="section-title">Account</h2>

        <div className="col">
          <div className="section-title">Login</div>
          <input className="input" placeholder="Email"/>
          <input className="input" placeholder="Password" type="password"/>
          <button className="button">Sign in</button>
        </div>

        <div className="col" style={{marginTop:16}}>
          <div className="section-title">Settings</div>
          <label>Display name</label>
          <input className="input" placeholder="Your name"/>
          <label>Phone</label>
          <input className="input" placeholder="+40 ..."/>
          <button className="button">Save</button>
        </div>

        <div className="col" style={{marginTop:16}}>
          <div className="section-title">Orders</div>
          <div className="product-card">
            <div className="product-thumb">RO</div>
            <div>
              <div style={{fontWeight:800}}>Tomatoes · 3 KG</div>
              <div className="price">36.00 RON — Preparing</div>
            </div>
          </div>
          <div className="product-card">
            <div className="product-thumb">AP</div>
            <div>
              <div style={{fontWeight:800}}>Apples · 2 KG</div>
              <div className="price">16.00 RON — Delivered</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="content" style={{display:"grid", placeItems:"center"}}>
        <div style={{textAlign:"center", opacity:.8}}>
          <div className="logo-badge" style={{margin:"0 auto 12px"}}>👨‍🌾</div>
          <h2 style={{margin:0}}>Green account</h2>
          <p>Manage your profile, verification and orders.</p>
        </div>
      </main>
    </div>
  );
}
