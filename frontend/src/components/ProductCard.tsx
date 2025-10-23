export default function ProductCard(props: {
  name: string; price?: string; tag?: string;
}){
  return (
    <div className="product-card">
      <div className="product-thumb">{props.name.slice(0,2).toUpperCase()}</div>
      <div style={{display:"grid"}}>
        <div style={{fontWeight:800}}>{props.name}</div>
        <div className="price">{props.price ?? ""}</div>
        {props.tag && <div className="badge" style={{marginTop:6, width:"fit-content"}}>{props.tag}</div>}
      </div>
    </div>
  );
}
