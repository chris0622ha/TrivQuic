import Link from 'next/link';
export const CONTACT = 'chris0622ha@gmail.com';
export const UPDATED = 'October 24, 2026';
export type Sec = { h: string; p?: string[]; ul?: string[] };
export default function Legal({ title, intro, sections }: { title: string; intro: string; sections: Sec[] }) {
  return (
    <div style={{minHeight:'100vh',background:'#130a24',fontFamily:"'DM Sans',system-ui,sans-serif",color:'#f3eeff',padding:'0 20px'}}>
      <nav style={{maxWidth:740,margin:'0 auto',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #3a2760'}}>
        <Link href="/" style={{color:'#ff4f8b',fontWeight:800,fontSize:18,textDecoration:'none'}}>TrivQuic</Link>
        <Link href="/" style={{color:'#a094c4',fontSize:13,textDecoration:'none'}}>← Back</Link>
      </nav>
      <main style={{maxWidth:740,margin:'32px auto 80px',lineHeight:1.7,fontSize:15}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:6}}>{title}</h1>
        <div style={{color:'#a094c4',fontSize:12,marginBottom:16}}>Last updated {UPDATED}</div>
        <p style={{color:'#cfc6ea'}}>{intro}</p>
        {sections.map(s => (
          <section key={s.h} style={{marginTop:26}}>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:6}}>{s.h}</h2>
            {s.p?.map((t,i)=><p key={i} style={{color:'#cfc6ea',margin:'6px 0'}}>{t}</p>)}
            {s.ul && <ul style={{color:'#cfc6ea',paddingLeft:22}}>{s.ul.map((t,i)=><li key={i} style={{margin:'4px 0'}}>{t}</li>)}</ul>}
          </section>
        ))}
        <p style={{marginTop:30,color:'#cfc6ea'}}>Questions or requests: <a href={`mailto:${CONTACT}`} style={{color:'#ff4f8b'}}>{CONTACT}</a></p>
      </main>
    </div>
  );
}
