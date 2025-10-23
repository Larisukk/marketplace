import { Routes, Route, useNavigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Account from "./pages/Account";

function BurgerIcon(){
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="#e8fff6" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function UserIcon(){
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z" stroke="#e8fff6" strokeWidth="2"/>
    </svg>
  );
}

function Header(){
  const nav = useNavigate();
  return (
    <header className="header">
      <div className="left">
        <button className="icon-btn" onClick={()=>nav("/")}>
          <BurgerIcon/>
        </button>
        <div className="logo">
          <div className="logo-badge">🛒</div>
          <div className="logo-text">BioBuy</div>
        </div>
      </div>
      <div className="right">
        <Link className="icon-btn" to="/account" title="Account">
          <UserIcon/>
        </Link>
      </div>
    </header>
  );
}

export default function App(){
  return (
    <>
      <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/browse" element={<Browse/>}/>
        <Route path="/account" element={<Account/>}/>
      </Routes>
    </>
  );
}
